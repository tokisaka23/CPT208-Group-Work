import fetch from 'node-fetch';
import { buildJsonResponse, getAuthenticatedUser, readJsonBody } from './supabase.js';

const CHAT_HISTORY_TABLE = 'chat_history';
const MAX_CHAT_HISTORY_ROUNDS = 30;
const MAX_FETCHED_CONVERSATIONS = 200;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function assertConversationId(conversationId) {
  if (!conversationId) {
    throw new Error('Missing conversationId');
  }

  if (!UUID_PATTERN.test(conversationId)) {
    const error = new Error('conversationId 必须是合法 UUID');
    error.statusCode = 400;
    throw error;
  }
}

async function resolveAuthenticatedChatUser(req, { required = false } = {}) {
  if (!readAuthorizationHeader(req)) {
    if (required) {
      const error = new Error('当前请求缺少登录凭证，请重新登录后再试。');
      error.statusCode = 401;
      throw error;
    }

    return null;
  }

  return getAuthenticatedUser(req);
}

async function loadPersistedHistory(adminClient, userId, conversationId) {
  const { data, error } = await adminClient
    .from(CHAT_HISTORY_TABLE)
    .select('id, conversation_id, user_input, ai_output, created_at')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(MAX_CHAT_HISTORY_ROUNDS);

  if (error) {
    throw new Error(`Failed to load chat history: ${error.message}`);
  }

  return data || [];
}

async function persistChatRound(adminClient, userId, conversationId, userInput, aiOutput) {
  const { error } = await adminClient.from(CHAT_HISTORY_TABLE).insert({
    user_id: userId,
    conversation_id: conversationId,
    user_input: userInput,
    ai_output: aiOutput,
  });

  if (error) {
    throw new Error(`Failed to insert chat history: ${error.message}`);
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

function createMessage(id, role, content, createdAt) {
  return {
    id,
    role,
    content,
    createdAt,
  };
}

function truncateText(value, maxLength = 28) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return '';
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function buildConversationSummary(conversationId, rows = []) {
  const messages = [];

  rows.forEach((row) => {
    const userInput = String(row.user_input || '').trim();
    const aiOutput = String(row.ai_output || '').trim();

    if (userInput) {
      messages.push(createMessage(`${row.id}-user`, 'user', userInput, row.created_at));
    }

    if (aiOutput) {
      messages.push(createMessage(`${row.id}-assistant`, 'assistant', aiOutput, row.created_at));
    }
  });

  const firstUserMessage = messages.find((item) => item.role === 'user');
  const lastMessage = [...messages].reverse().find((item) => item.role === 'assistant' || item.role === 'user');

  return {
    id: conversationId,
    title: truncateText(firstUserMessage?.content, 18) || '新建对话',
    preview: truncateText(lastMessage?.content, 28) || '还没有对话内容',
    updatedAt: rows.at(-1)?.created_at || null,
    messageCount: rows.length,
    messages,
  };
}

async function handleAsk(bodyData, req) {
  const message = String(bodyData?.message || '').trim() || 'Hello';
  const gpsLocation = String(bodyData?.gpsLocation || 'Unknown').trim() || 'Unknown';
  const conversationId = String(bodyData?.conversationId || '').trim();
  const apiKey = process.env.QWEN_API_KEY;

  if (!apiKey) {
    throw new Error('Missing QWEN_API_KEY environment variable');
  }

  assertConversationId(conversationId);

  const authenticatedContext = await resolveAuthenticatedChatUser(req);
  const persistedHistory = authenticatedContext
    ? await loadPersistedHistory(authenticatedContext.adminClient, authenticatedContext.user.id, conversationId)
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
      Authorization: `Bearer ${apiKey}`,
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
      conversationId,
      message,
      content,
    );
  }

  return { success: true, response: content };
}

async function handleHistory(req) {
  const { user, adminClient } = await resolveAuthenticatedChatUser(req, { required: true });
  const { data, error } = await adminClient
    .from(CHAT_HISTORY_TABLE)
    .select('id, conversation_id, user_input, ai_output, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(MAX_CHAT_HISTORY_ROUNDS * MAX_FETCHED_CONVERSATIONS);

  if (error) {
    throw new Error(`Failed to load chat history: ${error.message}`);
  }

  const groupedRows = new Map();

  (data || []).forEach((row) => {
    const conversationId = String(row.conversation_id || '').trim();

    if (!conversationId) {
      return;
    }

    if (!groupedRows.has(conversationId)) {
      groupedRows.set(conversationId, []);
    }

    groupedRows.get(conversationId).push(row);
  });

  const conversations = [...groupedRows.entries()]
    .map(([conversationId, rows]) => buildConversationSummary(conversationId, rows))
    .sort((left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime());

  return { success: true, conversations };
}

async function handleDelete(bodyData, req) {
  const { user, adminClient } = await resolveAuthenticatedChatUser(req, { required: true });
  const conversationId = String(bodyData?.conversationId || '').trim();

  assertConversationId(conversationId);

  const { error } = await adminClient
    .from(CHAT_HISTORY_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('conversation_id', conversationId);

  if (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }

  return {
    success: true,
    conversationId,
  };
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
    const action = String(bodyData?.action || 'ask').trim();

    if (action === 'ask') {
      return buildJsonResponse(res, 200, await handleAsk(bodyData, req));
    }

    if (action === 'history') {
      return buildJsonResponse(res, 200, await handleHistory(req));
    }

    if (action === 'delete') {
      return buildJsonResponse(res, 200, await handleDelete(bodyData, req));
    }

    return buildJsonResponse(res, 400, {
      success: false,
      error: `Unsupported action: ${action}`,
    });
  } catch (error) {
    console.error('[api/chat] request failed', error);
    return buildJsonResponse(res, error.statusCode || 500, {
      success: false,
      error: error.message || 'Chat request failed',
    });
  }
}
