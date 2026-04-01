import { createClient } from '@supabase/supabase-js';

export function buildJsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
}

export function readJsonBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'object') {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function readAuthorizationHeader(req) {
  return req.headers?.authorization || req.headers?.Authorization || '';
}

function readBearerToken(req) {
  const authorizationHeader = readAuthorizationHeader(req);

  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice('Bearer '.length).trim();
}

function getSupabaseEnv() {
  return {
    supabaseUrl:
      process.env.FY_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.VITE_FY_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      '',
    supabaseAnonKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.FY_SUPABASE_ANON_KEY ||
      process.env.VITE_FY_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      '',
    supabaseServiceRoleKey: process.env.FY_SUPABASE_SERVICE_ROLE_KEY || '',
  };
}

function createSupabaseClient(url, key) {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getServiceRoleClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseEnv();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      '缺少 Supabase 服务端环境变量。请在 .env.local 中配置 FY_SUPABASE_SERVICE_ROLE_KEY。'
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
}

export async function getAuthenticatedUser(req) {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getSupabaseEnv();

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error(
      '缺少 Supabase 服务端环境变量。请在 .env.local 中配置 FY_SUPABASE_SERVICE_ROLE_KEY，并确认 Supabase URL 与匿名 Key 已存在。'
    );
  }

  const accessToken = readBearerToken(req);

  if (!accessToken) {
    const error = new Error('当前请求缺少登录凭证，请重新登录后再试。');
    error.statusCode = 401;
    throw error;
  }

  const authClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  let authPayload = null;
  let error = null;

  try {
    authPayload = await authClient.auth.getUser(accessToken);
    error = authPayload.error;
  } catch (requestError) {
    const authError = new Error(
      `认证服务暂时不可用，请稍后重试。原始错误：${requestError.message || 'Unknown error'}`
    );
    authError.statusCode = 503;
    throw authError;
  }

  const user = authPayload?.data?.user || null;

  if (error || !user) {
    const authError = new Error(
      `当前登录状态已失效，请重新登录后再试。${error ? `原始错误：${error.message}` : ''}`
    );
    authError.statusCode = 401;
    throw authError;
  }

  return {
    user,
    adminClient: createSupabaseClient(supabaseUrl, supabaseServiceRoleKey),
  };
}
