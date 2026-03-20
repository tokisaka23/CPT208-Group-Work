import { requestAuthorizedJson } from './httpClient';

export const aiApi = {
  async askQianwen({ conversationId, message, messages, gpsLocation }) {
    return requestAuthorizedJson('/api/chat', {
      action: 'ask',
      conversationId,
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
};
