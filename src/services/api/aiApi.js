import { requestJson } from './httpClient';

export const aiApi = {
  async askQianwen({ message, messages, gpsLocation }) {
    return requestJson('/api/chat', {
      body: {
        message,
        messages,
        gpsLocation,
      },
    });
  },
};

