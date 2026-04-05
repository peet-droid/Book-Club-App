import { apiClient } from './client';

export const getBooks = async () => {
  return apiClient.get('/books');
};

export const getBook = async (id) => {
  return apiClient.get(`/books/${id}`);
};

export const createBook = async (data) => {
  return apiClient.post('/books', data);
};

export const updateBook = async ({ id, data }) => {
  return apiClient.put(`/books/${id}`, data);
};

export const deleteBook = async (id) => {
  return apiClient.delete(`/books/${id}`);
};
