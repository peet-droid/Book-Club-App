import { apiClient } from './client';

export const getMembers = async () => {
  return apiClient.get('/members');
};

export const getMember = async (id) => {
  return apiClient.get(`/members/${id}`);
};

export const createMember = async (data) => {
  return apiClient.post('/members', data);
};

export const updateMember = async ({ id, data }) => {
  return apiClient.put(`/members/${id}`, data);
};

export const deleteMember = async (id) => {
  return apiClient.delete(`/members/${id}`);
};

export const getMemberBooks = async (id) => {
  return apiClient.get(`/members/${id}/books`);
};

export const getMemberGroups = async (id) => {
  return apiClient.get(`/members/${id}/groups`);
};
