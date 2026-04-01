import { requestAuthorizedJson } from './httpClient';

export const aiApi = {
  async askQianwen({ conversationId, conversationName, message, messages, gpsLocation }) {
    return requestAuthorizedJson('/api/chat', {
      action: 'ask',
      conversationId,
      conversationName,
      message,
      messages,
      gpsLocation,
    });
  },

  async getChatHistory() {
    return requestAuthorizedJson('/api/chat', {
      action: 'history',
    });
  },

  async deleteChatConversation({ conversationId }) {
    return requestAuthorizedJson('/api/chat', {
      action: 'delete',
      conversationId,
    });
  },

  async renameChatConversation({ conversationId, conversationName }) {
    return requestAuthorizedJson('/api/chat', {
      action: 'rename',
      conversationId,
      conversationName,
    });
  },
};
