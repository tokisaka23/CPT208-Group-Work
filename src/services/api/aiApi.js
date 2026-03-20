import { requestAuthorizedJson } from './httpClient';

export const aiApi = {
  async askQianwen({ message, messages, gpsLocation }) {
    return requestAuthorizedJson('/api/chat', {
      message,
      messages,
      gpsLocation,
    });
  },

  async getChatHistory() {
    return requestAuthorizedJson('/api/chat-history', {});
  },
};
