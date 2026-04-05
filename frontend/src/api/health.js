import { apiClient } from './client';

export const checkHealth = async () => {
  return apiClient.get('/health');
};
