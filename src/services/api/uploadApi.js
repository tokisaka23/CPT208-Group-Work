import { requestJson } from './httpClient';

export const uploadApi = {
  async uploadGardenImage(formData) {
    return requestJson('/api/ugc', {
      body: formData,
      withAuth: true,
    });
  },
};

