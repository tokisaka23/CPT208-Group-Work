import { createHash } from 'crypto';
import {
  buildJsonResponse,
  getAuthenticatedUser,
  getServiceRoleClient,
  readJsonBody,
} from './supabase.js';
import {
  SECURITY_QUESTION_COLUMNS,
  SECURITY_QUESTION_FIELDS,
  normalizeSecurityAnswers,
} from '../src/shared/securityQuestions.js';

function hashSecurityAnswer(value) {
  return createHash('sha256').update(value).digest('hex');
}

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

async function handleSecurityQuestionPasswordReset(req, res) {
  if (req.method === 'OPTIONS') {
    buildJsonResponse(res, 200, { success: true });
    return;
  }

  if (req.method !== 'POST') {
    buildJsonResponse(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = readJsonBody(req);
    const email = String(body.email || '').trim();
    const newPassword = String(body.newPassword || '');
    const normalizedAnswers = normalizeSecurityAnswers(body.securityAnswers || {});

    if (!email) {
      buildJsonResponse(res, 400, { error: '请输入注册邮箱。' });
      return;
    }

    if (!newPassword) {
      buildJsonResponse(res, 400, { error: '请输入新密码。' });
      return;
    }

    if (newPassword.length < 6) {
      buildJsonResponse(res, 400, { error: '新密码长度至少需要 6 位。' });
      return;
    }

    const hasMissingAnswer = SECURITY_QUESTION_FIELDS.some((field) => !normalizedAnswers[field]);
    if (hasMissingAnswer) {
      buildJsonResponse(res, 400, { error: '请完整回答三个安全问题。' });
      return;
    }

    const serviceClient = getServiceRoleClient();
    const profileFields = ['id', ...Object.values(SECURITY_QUESTION_COLUMNS)].join(', ');
    const { data: profile, error: profileError } = await serviceClient
      .from('user_profiles')
      .select(profileFields)
      .ilike('auth_email', email)
      .maybeSingle();

    if (profileError) {
      throw new Error(`查询账号信息失败：${profileError.message}`);
    }

    if (!profile?.id) {
      buildJsonResponse(res, 400, { error: '邮箱或安全问题答案不正确。' });
      return;
    }

    const hasStoredAnswers = SECURITY_QUESTION_FIELDS.every(
      (field) => profile[SECURITY_QUESTION_COLUMNS[field]],
    );
    if (!hasStoredAnswers) {
      buildJsonResponse(res, 400, {
        error: '该账号尚未设置安全问题，暂时无法通过此方式重置密码。',
      });
      return;
    }

    const isMatched = SECURITY_QUESTION_FIELDS.every((field) => {
      const expectedHash = profile[SECURITY_QUESTION_COLUMNS[field]];
      return expectedHash === hashSecurityAnswer(normalizedAnswers[field]);
    });
    if (!isMatched) {
      buildJsonResponse(res, 400, { error: '邮箱或安全问题答案不正确。' });
      return;
    }

    const { error: updateError } = await serviceClient.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    });
    if (updateError) {
      throw new Error(`更新密码失败：${updateError.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      message: '安全问题验证通过，密码已重置，请使用新密码登录。',
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '重置密码失败，请稍后再试。',
    });
  }
}

function resolveAuthAction(req) {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const queryAction = requestUrl.searchParams.get('action');

  if (queryAction) {
    return queryAction;
  }

  const pathnameParts = requestUrl.pathname.split('/').filter(Boolean);
  return pathnameParts[pathnameParts.length - 1] || '';
}

const authActionHandlers = {
  'delete-account': handleDeleteAccount,
  'reset-password': handleSecurityQuestionPasswordReset,
};

export default async function authHandler(req, res) {
  const action = resolveAuthAction(req);
  const routeHandler = authActionHandlers[action];

  if (!routeHandler) {
    buildJsonResponse(res, 404, { error: 'Auth route not found' });
    return;
  }

  await routeHandler(req, res);
}

export const authHandlers = {
  '/api/auth/delete-account': handleDeleteAccount,
  '/api/auth/reset-password': handleSecurityQuestionPasswordReset,
};
