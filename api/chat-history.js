import { buildJsonResponse, getAuthenticatedUser } from './supabase.js';

const CHAT_HISTORY_TABLE = 'chat_history';
const MAX_CHAT_HISTORY_ROUNDS = 30;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return buildJsonResponse(res, 200, { success: true });
  }

  if (req.method !== 'POST') {
    return buildJsonResponse(res, 405, { success: false, error: 'Method Not Allowed' });
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { data, error } = await adminClient
      .from(CHAT_HISTORY_TABLE)
      .select('id, user_input, ai_output, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(MAX_CHAT_HISTORY_ROUNDS);

    if (error) {
      throw new Error(`Failed to load chat history: ${error.message}`);
    }

    return buildJsonResponse(res, 200, {
      success: true,
      history: data || [],
    });
  } catch (error) {
    console.error('[api/chat-history] request failed', error);
    return buildJsonResponse(res, error.statusCode || 500, {
      success: false,
      error: error.message || 'Failed to load chat history',
    });
  }
}
