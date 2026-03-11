import crypto from 'crypto';
import fetch from 'node-fetch';

function getDatabaseConfig() {
  return {
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function ensureDatabaseConfig() {
  const { supabaseUrl, serviceRoleKey } = getDatabaseConfig();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      '缺少数据库环境变量，请在 .env.local 中配置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY。'
    );
  }

  return { supabaseUrl, serviceRoleKey };
}

function createHeaders(serviceRoleKey, extraHeaders = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
}

function normalizeUserId(userId) {
  return String(userId || '').trim().toLowerCase();
}

function buildUrl(supabaseUrl, pathname, query = '') {
  return `${supabaseUrl}/rest/v1/${pathname}${query}`;
}

async function requestSupabase(pathname, options = {}) {
  const { supabaseUrl, serviceRoleKey } = ensureDatabaseConfig();

  const response = await fetch(buildUrl(supabaseUrl, pathname, options.query || ''), {
    method: options.method || 'GET',
    headers: createHeaders(serviceRoleKey, options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(errorBody || `数据库请求失败，状态码：${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hashedValue = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hashedValue}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = String(storedHash || '').split(':');

  if (!salt || !originalHash) {
    return false;
  }

  const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(
    Buffer.from(originalHash, 'hex'),
    Buffer.from(computedHash, 'hex')
  );
}

function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSessionExpiry() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry.toISOString();
}

async function findUserByUserId(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const query = `?select=id,user_id,password_hash&user_id=eq.${encodeURIComponent(normalizedUserId)}&limit=1`;
  const rows = await requestSupabase('app_users', { query });
  return rows?.[0] || null;
}

async function createSessionForUser(user) {
  const sessionToken = createSessionToken();
  const expiresAt = createSessionExpiry();

  const rows = await requestSupabase('app_user_sessions', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: [
      {
        user_db_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt,
      },
    ],
  });

  const sessionRow = rows?.[0];

  return {
    mode: 'registered',
    token: sessionRow?.session_token || sessionToken,
    expiresAt: sessionRow?.expires_at || expiresAt,
    user: {
      id: user.id,
      username: user.user_id,
      userId: user.user_id,
    },
  };
}

export async function registerDatabaseUser({ userId, password }) {
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId) {
    throw new Error('用户ID不能为空。');
  }

  if (!password || password.length < 4) {
    throw new Error('密码至少需要 4 位。');
  }

  const existingUser = await findUserByUserId(normalizedUserId);

  if (existingUser) {
    throw new Error('这个用户ID已经被注册了，请换一个。');
  }

  const rows = await requestSupabase('app_users', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: [
      {
        user_id: normalizedUserId,
        password_hash: hashPassword(password),
      },
    ],
  });

  return createSessionForUser(rows[0]);
}

export async function loginDatabaseUser({ userId, password }) {
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId) {
    throw new Error('用户ID不能为空。');
  }

  if (!password) {
    throw new Error('密码不能为空。');
  }

  const user = await findUserByUserId(normalizedUserId);

  if (!user) {
    throw new Error('没有找到这个用户ID，请先注册。');
  }

  if (!verifyPassword(password, user.password_hash)) {
    throw new Error('密码不正确，请重新输入。');
  }

  return createSessionForUser(user);
}

export async function getDatabaseSession(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  const query =
    `?select=id,user_db_id,session_token,expires_at` +
    `&session_token=eq.${encodeURIComponent(sessionToken)}` +
    `&expires_at=gt.${encodeURIComponent(new Date().toISOString())}` +
    `&limit=1`;

  const rows = await requestSupabase('app_user_sessions', { query });
  const sessionRow = rows?.[0];

  if (!sessionRow) {
    return null;
  }

  const userQuery = `?select=id,user_id&id=eq.${encodeURIComponent(sessionRow.user_db_id)}&limit=1`;
  const userRows = await requestSupabase('app_users', { query: userQuery });
  const user = userRows?.[0];

  if (!user) {
    return null;
  }

  return {
    mode: 'registered',
    token: sessionRow.session_token,
    expiresAt: sessionRow.expires_at,
    user: {
      id: user.id,
      username: user.user_id,
      userId: user.user_id,
    },
  };
}

export async function deleteDatabaseSession(sessionToken) {
  if (!sessionToken) {
    return;
  }

  await requestSupabase('app_user_sessions', {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
    query: `?session_token=eq.${encodeURIComponent(sessionToken)}`,
  });
}
