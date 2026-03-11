import { getSupabaseClient } from '../supabase/clientRuntime';

async function requestAuth(pathname, body) {
  const response = await fetch(pathname, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.error || `请求失败，状态码：${response.status}`);
  }

  return data.session;
}

async function applySupabaseSession(sessionPayload) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.setSession({
    access_token: sessionPayload.access_token,
    refresh_token: sessionPayload.refresh_token,
  });

  if (error) {
    throw error;
  }

  if (!data.session || !data.user) {
    throw new Error('未能建立 Supabase 登录会话。');
  }

  return {
    mode: 'registered',
    session: data.session,
    user: {
      id: data.user.id,
      username: sessionPayload.user?.username || data.user.user_metadata?.username || '',
      friendCode: sessionPayload.user?.friendCode || '',
      displayName:
        sessionPayload.user?.displayName ||
        data.user.user_metadata?.display_name ||
        sessionPayload.user?.username ||
        '已登录用户',
    },
  };
}

export async function registerWithUsername({ username, password }) {
  const sessionPayload = await requestAuth('/api/auth/register', {
    username,
    password,
  });

  return applySupabaseSession(sessionPayload);
}

export async function loginWithUsername({ username, password }) {
  const sessionPayload = await requestAuth('/api/auth/login', {
    username,
    password,
  });

  return applySupabaseSession(sessionPayload);
}
