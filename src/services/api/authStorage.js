const AUTH_STORAGE_KEY = 'suzhou_garden_auth_state';

function hasLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function persistAuthState(authState) {
  if (!hasLocalStorage() || !authState) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
}

export function readStoredAuthState() {
  if (!hasLocalStorage()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.error('[api] 读取本地登录信息失败', error);
    return null;
  }
}

export function clearStoredAuthState() {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

