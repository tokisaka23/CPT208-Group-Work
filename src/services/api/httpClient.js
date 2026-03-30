import { getCurrentSession } from '../supabase/authRuntime';
import { readStoredAuthState } from './authStorage';

async function getBearerToken() {
  try {
    const session = await getCurrentSession();
    return session?.access_token || readStoredAuthState()?.accessToken || '';
  } catch (error) {
    console.error('[api] ªÒ»° access token  ß∞‹', error);
    return readStoredAuthState()?.accessToken || '';
  }
}

function buildRequestError(response, result, fallbackMessage) {
  return new Error(result?.error || result?.message || `${fallbackMessage}£¨◊¥Ã¨¬Î£∫${response.status}`);
}

export async function requestJson(path, { method = 'POST', body, withAuth = false } = {}) {
  const headers = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (withAuth) {
    const accessToken = await getBearerToken();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const requestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    requestInit.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(path, requestInit);
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result?.success === false) {
      throw buildRequestError(response, result, `«Î«Û ${path}  ß∞‹`);
    }

    return result;
  } catch (error) {
    console.error(`[api] «Î«Û ${path}  ß∞‹`, error);
    throw error;
  }
}

export async function requestAuthorizedJson(path, body = {}, options = {}) {
  return requestJson(path, {
    ...options,
    body,
    withAuth: true,
  });
}
