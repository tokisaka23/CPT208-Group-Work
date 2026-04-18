const CHAT_LANGUAGES = ['zh', 'en', 'ja', 'ko'];

function countMatches(text, pattern) {
  return text.match(pattern)?.length || 0;
}

export function normalizeChatLanguage(language, fallbackLanguage = 'zh') {
  const normalized = String(language || '').trim().toLowerCase();

  if (CHAT_LANGUAGES.includes(normalized)) {
    return normalized;
  }

  const fallback = String(fallbackLanguage || '').trim().toLowerCase();
  return CHAT_LANGUAGES.includes(fallback) ? fallback : 'zh';
}

export function detectMessageLanguage(message) {
  const normalized = String(message || '').trim();

  if (!normalized) {
    return '';
  }

  if (/[\uac00-\ud7af]/u.test(normalized)) {
    return 'ko';
  }

  if (/[\u3040-\u30ff]/u.test(normalized)) {
    return 'ja';
  }

  const hanCount = countMatches(normalized, /[\u3400-\u9fff]/gu);
  const latinCount = countMatches(normalized, /[A-Za-z]/g);

  if (!hanCount && !latinCount) {
    return '';
  }

  if (latinCount && !hanCount) {
    return 'en';
  }

  if (hanCount && !latinCount) {
    return 'zh';
  }

  return latinCount >= hanCount ? 'en' : 'zh';
}

export function inferChatLanguage({ message = '', messages = [], fallbackLanguage = 'zh' } = {}) {
  const currentMessageLanguage = detectMessageLanguage(message);

  if (currentMessageLanguage) {
    return currentMessageLanguage;
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const item = messages[index];

    if (item?.role !== 'user') {
      continue;
    }

    const historyLanguage = detectMessageLanguage(item.content);

    if (historyLanguage) {
      return historyLanguage;
    }
  }

  return normalizeChatLanguage(fallbackLanguage);
}

export function buildReplyLanguageInstruction(language) {
  switch (normalizeChatLanguage(language)) {
    case 'en':
      return 'Reply in warm, conversational English.';
    case 'ja':
      return 'Reply in warm, conversational Japanese.';
    case 'ko':
      return 'Reply in warm, conversational Korean.';
    default:
      return 'Reply in warm, conversational Simplified Chinese.';
  }
}
