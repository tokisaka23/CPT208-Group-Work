import {
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from '../supabase/authRuntime';
import { isSupabaseConfigured } from '../supabase/clientRuntime';
import {
  clearStoredAuthState,
  persistAuthState,
} from './authStorage';
import { requestJson } from './httpClient';

const LOCAL_AUTH_EVENT = 'suzhou-local-auth-changed';

function normalizeRegisteredUser(user, session = null) {
  return {
    id: user?.id || '',
    email: user?.email || '',
    username:
      user?.user_metadata?.display_name ||
      user?.email?.split('@')[0] ||
      '已登录用户',
    friendCode: user?.user_metadata?.friend_code || '',
    accessToken: session?.access_token || '',
    refreshToken: session?.refresh_token || '',
  };
}

function emitLocalAuthChanged(authState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LOCAL_AUTH_EVENT, {
      detail: authState,
    }),
  );
}

export const authApi = {
  async login({ email, password }) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        '尚未配置真实 Supabase 登录环境变量。请在 .env.local 中填写 VITE_FY_SUPABASE_URL / VITE_FY_SUPABASE_ANON_KEY，或使用 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY，然后重启前端。',
      );
    }

    try {
      const data = await signInWithEmail({ email, password });
      const authState = normalizeRegisteredUser(data.user, data.session);
      persistAuthState(authState);
      return {
        ...authState,
        session: data.session ?? null,
        rawUser: data.user ?? null,
      };
    } catch (error) {
      console.error('[authApi.login] 登录失败', error);
      throw error;
    }
  },

  async register({ displayName, email, password, securityAnswers }) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        '尚未配置真实 Supabase 注册环境变量。请在 .env.local 中填写 VITE_FY_SUPABASE_URL / VITE_FY_SUPABASE_ANON_KEY，或使用 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY，然后重启前端。',
      );
    }

    try {
      const data = await signUpWithEmail({ displayName, email, password, securityAnswers });
      const authState = data.session ? normalizeRegisteredUser(data.user, data.session) : null;

      if (authState) {
        persistAuthState(authState);
      }

      return {
        ...(authState || normalizeRegisteredUser(data.user)),
        session: data.session ?? null,
        rawUser: data.user ?? null,
        requiresEmailConfirmation: !data.session,
      };
    } catch (error) {
      console.error('[authApi.register] 注册失败', error);
      throw error;
    }
  },

  async resetPassword({ email, newPassword, securityAnswers }) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        '当前尚未配置真实 Supabase 环境变量。请先完成 `.env.local` 配置后再重试。',
      );
    }

    try {
      return await requestJson('/api/auth/reset-password', {
        body: {
          email,
          newPassword,
          securityAnswers,
        },
      });
    } catch (error) {
      console.error('[authApi.resetPassword] 重置密码失败', error);
      throw error;
    }
  },

  async restore() {
    if (!isSupabaseConfigured()) {
      clearStoredAuthState();
      return null;
    }

    try {
      const session = await getCurrentSession();

      if (!session) {
        clearStoredAuthState();
        return null;
      }

      const user = session.user || (await getCurrentUser());
      const authState = normalizeRegisteredUser(user, session);
      persistAuthState(authState);
      return authState;
    } catch (error) {
      console.error('[authApi.restore] 恢复登录状态失败', error);
      throw error;
    }
  },

  async logout() {
    try {
      if (isSupabaseConfigured()) {
        await signOut();
      }
    } catch (error) {
      console.error('[authApi.logout] 退出登录失败', error);
      throw error;
    } finally {
      clearStoredAuthState();
      emitLocalAuthChanged(null);
    }
  },

  async updateProfile({ displayName }) {
    if (!isSupabaseConfigured()) {
      throw new Error('尚未配置真实 Supabase 环境变量。');
    }

    const data = await updateCurrentUserProfile({ displayName });
    const session = await getCurrentSession();
    const authState = normalizeRegisteredUser(data.user, session);
    persistAuthState(authState);
    emitLocalAuthChanged(authState);
    return authState;
  },

  async updatePassword({ password }) {
    if (!isSupabaseConfigured()) {
      throw new Error('尚未配置真实 Supabase 环境变量。');
    }

    await updateCurrentUserPassword({ password });
    return { success: true };
  },

  subscribe(callback) {
    if (!isSupabaseConfigured()) {
      return {
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      };
    }

    return onAuthStateChange((_event, session) => {
      if (!session) {
        clearStoredAuthState();
        callback(null);
        return;
      }

      const authState = normalizeRegisteredUser(session.user, session);
      persistAuthState(authState);
      callback(authState);
    });
  },
};
