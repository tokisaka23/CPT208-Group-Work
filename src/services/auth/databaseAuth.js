const tokenStorageKey = 'cpt208_auth_token';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function saveToken(token) {
  const storage = getStorage();

  if (!storage || !token) {
    return;
  }

  storage.setItem(tokenStorageKey, token);
}

function readToken() {
  const storage = getStorage();

  if (!storage) {
    return '';
  }

  return storage.getItem(tokenStorageKey) || '';
}

function clearToken() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(tokenStorageKey);
}

async function requestAuth(pathname, options = {}) {
  const response = await fetch(pathname, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.error || `请求失败，状态码：${response.status}`);
  }

  return data;
}

export async function registerWithDatabase({ userId, password }) {
  const data = await requestAuth('/api/auth/register', {
    method: 'POST',
    body: { userId, password },
  });

  saveToken(data.session?.token);
  return data.session;
}

export async function loginWithDatabase({ userId, password }) {
  const data = await requestAuth('/api/auth/login', {
    method: 'POST',
    body: { userId, password },
  });

  saveToken(data.session?.token);
  return data.session;
}

export async function restoreDatabaseSession() {
  const token = readToken();

  if (!token) {
    return null;
  }

  try {
    const data = await requestAuth('/api/auth/session', {
      token,
    });
    saveToken(data.session?.token || token);
    return data.session;
  } catch {
    clearToken();
    return null;
  }
}

export async function logoutDatabaseSession() {
  const token = readToken();

  if (token) {
    try {
      await requestAuth('/api/auth/logout', {
        method: 'POST',
        token,
      });
    } catch {
      // 即使后端退出失败，也要清理本地 token，避免用户被卡住
    }
  }

  clearToken();
}

export function continueAsGuestSession() {
  return {
    mode: 'guest',
    user: {
      id: `guest_${Date.now()}`,
      userId: 'guest',
      username: '游客',
    },
  };
}
