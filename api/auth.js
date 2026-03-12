import { buildJsonResponse, getAuthenticatedUser } from './supabase.js';

async function handleDeleteAccount(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { error } = await adminClient.auth.admin.deleteUser(user.id);

    if (error) {
      throw new Error(`注销账号失败：${error.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      message: '账号已注销。',
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '注销账号失败，请稍后再试。',
    });
  }
}

export const authHandlers = {
  '/api/auth/delete-account': handleDeleteAccount,
};
