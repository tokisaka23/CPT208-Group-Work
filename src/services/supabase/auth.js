import { getSupabaseClient } from './client';
import {
  clearGuestSession,
  ensureGuestSession,
} from '../../utils/guestSession';

export async function signUpWithEmail({ email, password, displayName }) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        auth_provider: 'email',
      },
    },
  });

  if (error) {
    throw error;
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

export function startWechatLogin() {
  const wechatLoginUrl = import.meta.env.VITE_WECHAT_LOGIN_URL;

  if (!wechatLoginUrl) {
    throw new Error(
      '尚未配置微信登录地址，请在 .env.local 中补充 VITE_WECHAT_LOGIN_URL。'
    );
  }

  if (typeof window !== 'undefined') {
    window.location.href = wechatLoginUrl;
  }
}
