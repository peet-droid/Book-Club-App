import { apiClient } from './client';

export const searchBooks = async (params) => {
  return apiClient.get('/search/books', { params });
};

export const searchWhoHas = async (title) => {
  return apiClient.get('/search/who-has', { params: { title } });
};
