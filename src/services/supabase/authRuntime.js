import { getSupabaseClient } from './clientRuntime';
import { clearGuestSession, ensureGuestSession } from '../../utils/guestSession';

function readEmailLocalPart(email) {
  return String(email || '').split('@')[0] || '';
}

function normalizeUsernamePart(value) {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalizedValue || 'user';
}

function buildProfileUsername(user) {
  const basePart = normalizeUsernamePart(readEmailLocalPart(user.email));
  const suffix = String(user.id || '').replace(/-/g, '').slice(0, 8) || 'profile';
  return `${basePart.slice(0, 20)}_${suffix}`;
}

function buildProfilePayload(user, displayName) {
  if (!user.email) {
    throw new Error('当前账号缺少邮箱信息，无法初始化用户资料。');
  }

  return {
    id: user.id,
    username: buildProfileUsername(user),
    auth_email: user.email,
    display_name: displayName,
    avatar_url: null,
    role: 'user',
    status: 'active',
  };
}

function buildEmailRedirectTo() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/`;
}

async function ensureUserProfile(user, displayName) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('user_profiles').upsert(buildProfilePayload(user, displayName), {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(
      `认证已成功，但 user_profiles 写入失败。请先执行 database/001_user_auth_schema.sql。原始错误：${error.message}`
    );
  }
}

export async function signUpWithEmail({ email, password, displayName }) {
  const supabase = getSupabaseClient();
  const emailRedirectTo = buildEmailRedirectTo();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        display_name: displayName,
        auth_provider: 'email',
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.user && data.session) {
    await ensureUserProfile(data.user, displayName);
  }

  clearGuestSession();
  return data;
}

export async function signInWithEmail({ email, password }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    const fallbackDisplayName =
      data.user.user_metadata?.display_name || readEmailLocalPart(data.user.email) || '新用户';
    await ensureUserProfile(data.user, fallbackDisplayName);
  }

  clearGuestSession();
  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function updateCurrentUserProfile({ displayName }) {
  const supabase = getSupabaseClient();
  const normalizedDisplayName = String(displayName || '').trim();

  if (!normalizedDisplayName) {
    throw new Error('昵称不能为空。');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('当前没有可用的登录用户。');
  }

  const { data, error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      display_name: normalizedDisplayName,
    },
  });

  if (error) {
    throw error;
  }

  await ensureUserProfile(data.user || user, normalizedDisplayName);
  return data;
}

export async function updateCurrentUserPassword({ password }) {
  const supabase = getSupabaseClient();
  const normalizedPassword = String(password || '');

  if (normalizedPassword.length < 6) {
    throw new Error('新密码长度至少 6 位。');
  }

  const { data, error } = await supabase.auth.updateUser({
    password: normalizedPassword,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCurrentAccount() {
  const supabase = getSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`获取当前登录会话失败：${sessionError.message}`);
  }

  if (!session?.access_token) {
    throw new Error('当前没有可用的登录会话，请重新登录后再试。');
  }

  const response = await fetch('/api/auth/delete-account', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const rawText = await response.text();
  let result = null;

  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
      (rawText && rawText.length < 200 ? rawText : '') ||
      `注销账号失败，状态码：${response.status}`
    );
  }

  await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  return result;
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}

export function continueAsGuest() {
  return ensureGuestSession();
}
