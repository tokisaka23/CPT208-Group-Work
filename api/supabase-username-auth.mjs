import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function getAuthConfig() {
  return {
    supabaseUrl: process.env.FY_SUPABASE_URL || process.env.VITE_FY_SUPABASE_URL,
    serviceRoleKey: process.env.FY_SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.FY_SUPABASE_ANON_KEY || process.env.VITE_FY_SUPABASE_ANON_KEY,
  };
}

function ensureAuthConfig() {
  const config = getAuthConfig();

  if (!config.supabaseUrl || !config.serviceRoleKey || !config.anonKey) {
    throw new Error(
      '缺少 Supabase Auth 环境变量，请在 .env.local 中配置 FY_SUPABASE_URL、FY_SUPABASE_SERVICE_ROLE_KEY 和 VITE_FY_SUPABASE_ANON_KEY。'
    );
  }

  return config;
}

function createAdminClient() {
  const { supabaseUrl, serviceRoleKey } = ensureAuthConfig();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function createPublicClient() {
  const { supabaseUrl, anonKey } = ensureAuthConfig();
  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function validateUsername(username) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    throw new Error('用户名不能为空。');
  }

  if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
    throw new Error('用户名只允许 3-20 位小写字母、数字或下划线。');
  }

  return normalizedUsername;
}

function validatePassword(password) {
  if (!String(password || '').trim()) {
    throw new Error('密码不能为空。');
  }

  if (String(password).length < 4) {
    throw new Error('密码至少需要 4 位。');
  }

  return String(password);
}

function buildInternalEmail(username) {
  return `${username}.${crypto.randomUUID()}@username.local`;
}

function createFriendCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let friendCode = '';

  for (let index = 0; index < 8; index += 1) {
    friendCode += chars[crypto.randomInt(0, chars.length)];
  }

  return friendCode;
}

async function findProfileByUsername(username) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('user_profiles')
    .select('id, username, friend_code, auth_email, display_name')
    .eq('username', username)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`查询用户名失败：${error.message}`);
  }

  return data;
}

async function findProfileByFriendCode(friendCode) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('user_profiles')
    .select('id')
    .eq('friend_code', friendCode)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`检查好友码失败：${error.message}`);
  }

  return data;
}

async function upsertUserProfile(profile) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from('user_profiles').upsert(profile, {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(`写入 user_profiles 失败：${error.message}`);
  }
}

async function createUniqueFriendCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const friendCode = createFriendCode();
    const existingProfile = await findProfileByFriendCode(friendCode);

    if (!existingProfile) {
      return friendCode;
    }
  }

  throw new Error('生成好友码失败，请稍后重试。');
}

async function signInWithInternalEmail(authEmail, password) {
  const publicClient = createPublicClient();
  const { data, error } = await publicClient.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error) {
    throw new Error(error.message || '登录失败。');
  }

  if (!data.session || !data.user) {
    throw new Error('登录成功，但未拿到 Supabase 会话。');
  }

  return data;
}

function buildAuthResponse(data, profile) {
  return {
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: {
        id: data.user.id,
        username: profile.username,
        friendCode: profile.friend_code,
        displayName: profile.display_name,
      },
    },
  };
}

export async function registerUsernameUser({ username, password }) {
  const normalizedUsername = validateUsername(username);
  const safePassword = validatePassword(password);

  const existingProfile = await findProfileByUsername(normalizedUsername);
  if (existingProfile) {
    throw new Error('这个用户名已经被注册了，请换一个。');
  }

  const adminClient = createAdminClient();
  const authEmail = buildInternalEmail(normalizedUsername);
  const friendCode = await createUniqueFriendCode();
  const { data, error } = await adminClient.auth.admin.createUser({
    email: authEmail,
    password: safePassword,
    email_confirm: true,
    user_metadata: {
      username: normalizedUsername,
      display_name: normalizedUsername,
      auth_provider: 'username',
    },
  });

  if (error) {
    throw new Error(error.message || '创建认证账号失败。');
  }

  const authUser = data.user;
  if (!authUser) {
    throw new Error('创建认证账号失败，未返回用户信息。');
  }

  try {
    await upsertUserProfile({
      id: authUser.id,
      username: normalizedUsername,
      friend_code: friendCode,
      auth_email: authEmail,
      display_name: normalizedUsername,
      role: 'user',
      status: 'active',
    });
  } catch (error) {
    await adminClient.auth.admin.deleteUser(authUser.id).catch(() => {});
    throw error;
  }

  const signInData = await signInWithInternalEmail(authEmail, safePassword);
  return buildAuthResponse(signInData, {
    username: normalizedUsername,
    friend_code: friendCode,
    display_name: normalizedUsername,
  });
}

export async function loginUsernameUser({ username, password }) {
  const normalizedUsername = validateUsername(username);
  const safePassword = validatePassword(password);

  const profile = await findProfileByUsername(normalizedUsername);
  if (!profile) {
    throw new Error('没有找到这个用户名，请先注册。');
  }

  const signInData = await signInWithInternalEmail(profile.auth_email, safePassword);
  return buildAuthResponse(signInData, profile);
}
