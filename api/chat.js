import fetch from 'node-fetch';
import { buildJsonResponse, getAuthenticatedUser, readJsonBody } from './supabase.js';

const CHAT_HISTORY_TABLE = 'chat_history';
const MAX_CHAT_HISTORY_ROUNDS = 30;

function readAuthorizationHeader(req) {
  return req.headers?.authorization || req.headers?.Authorization || '';
}

function normalizeChatMessages(messages = []) {
  return messages
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .map((item) => ({
      role: item.role,
      content: String(item.content || '').trim(),
    }))
    .filter((item) => item.content);
}

async function resolveAuthenticatedChatUser(req) {
  if (!readAuthorizationHeader(req)) {
    return null;
  }

  return getAuthenticatedUser(req);
}

async function loadPersistedHistory(adminClient, userId) {
  const { data, error } = await adminClient
    .from(CHAT_HISTORY_TABLE)
    .select('id, user_input, ai_output, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(MAX_CHAT_HISTORY_ROUNDS);

  if (error) {
    throw new Error(`Failed to load chat history: ${error.message}`);
  }

  return data || [];
}

async function persistChatRound(adminClient, userId, userInput, aiOutput, existingHistory = []) {
  const nextPayload = {
    user_id: userId,
    user_input: userInput,
    ai_output: aiOutput,
    created_at: new Date().toISOString(),
  };

  if (existingHistory.length < MAX_CHAT_HISTORY_ROUNDS) {
    const { error } = await adminClient.from(CHAT_HISTORY_TABLE).insert(nextPayload);

    if (error) {
      throw new Error(`Failed to insert chat history: ${error.message}`);
    }

    return;
  }

  const oldestHistory = existingHistory[0];
  const { error } = await adminClient
    .from(CHAT_HISTORY_TABLE)
    .update(nextPayload)
    .eq('id', oldestHistory.id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to rotate chat history: ${error.message}`);
  }
}

function buildModelMessages({ systemPrompt, persistedHistory, fallbackMessages, currentMessage, usePersistedHistory }) {
  const messages = [{ role: 'system', content: systemPrompt }];

  if (usePersistedHistory) {
    persistedHistory.forEach((item) => {
      const userInput = String(item.user_input || '').trim();
      const aiOutput = String(item.ai_output || '').trim();

      if (userInput) {
        messages.push({ role: 'user', content: userInput });
      }

      if (aiOutput) {
        messages.push({ role: 'assistant', content: aiOutput });
      }
    });

    messages.push({ role: 'user', content: currentMessage });
    return messages;
  }

  const normalizedFallbackMessages = normalizeChatMessages(fallbackMessages);
  return messages.concat(
    normalizedFallbackMessages.length ? normalizedFallbackMessages : [{ role: 'user', content: currentMessage }],
  );
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return buildJsonResponse(res, 200, { success: true });
  }

  if (req.method !== 'POST') {
    return buildJsonResponse(res, 405, { success: false, error: 'Method Not Allowed' });
  }

  try {
    const bodyData = readJsonBody(req);
    const message = String(bodyData?.message || '').trim() || 'Hello';
    const gpsLocation = String(bodyData?.gpsLocation || 'Unknown').trim() || 'Unknown';
    const API_KEY = process.env.QWEN_API_KEY;

    if (!API_KEY) {
      throw new Error('Missing QWEN_API_KEY environment variable');
    }

    const authenticatedContext = await resolveAuthenticatedChatUser(req);
    const persistedHistory = authenticatedContext
      ? await loadPersistedHistory(authenticatedContext.adminClient, authenticatedContext.user.id)
      : [];

    const systemPrompt = `You are a senior local Suzhou guide with deep knowledge of Wu culture. User location: ${gpsLocation}. Reply in warm, conversational Chinese, include one historical detail or practical tip, and keep it within 150 Chinese characters.`;
    const modelMessages = buildModelMessages({
      systemPrompt,
      persistedHistory,
      fallbackMessages: bodyData?.messages,
      currentMessage: message,
      usePersistedHistory: Boolean(authenticatedContext?.user?.id),
    });

    const aiResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: modelMessages,
        },
        parameters: { result_format: 'message' },
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json().catch(() => ({}));
      throw new Error(err.message || `DashScope returned status ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const content = data.output?.choices?.[0]?.message?.content?.trim() || 'No content returned';

    if (authenticatedContext?.user?.id) {
      await persistChatRound(
        authenticatedContext.adminClient,
        authenticatedContext.user.id,
        message,
        content,
        persistedHistory,
      );
    }

    return buildJsonResponse(res, 200, { success: true, response: content });
  } catch (error) {
    console.error('[api/chat] request failed', error);
    return buildJsonResponse(res, error.statusCode || 500, {
      success: false,
      error: error.message || 'Chat request failed',
    });
  }
}
