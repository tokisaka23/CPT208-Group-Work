import { getSupabaseClient } from './clientRuntime';
import { clearGuestSession, ensureGuestSession } from '../../utils/guestSession';

function buildProfilePayload(user, displayName) {
  return {
    id: user.id,
    display_name: displayName,
    avatar_url: null,
    role: 'user',
    status: 'active',
  };
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
      data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || '新用户';
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
