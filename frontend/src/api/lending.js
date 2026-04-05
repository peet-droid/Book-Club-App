import { apiClient } from './client';

export const getLendRequests = async (params) => {
  return apiClient.get('/lend-requests', { params });
};

export const createLendRequest = async (data) => {
  return apiClient.post('/lend-requests', data);
};

export const approveLendRequest = async (id) => {
  return apiClient.patch(`/lend-requests/${id}/approve`);
};

export const rejectLendRequest = async (id) => {
  return apiClient.patch(`/lend-requests/${id}/reject`);
};

export const returnLendRequest = async (id) => {
  return apiClient.patch(`/lend-requests/${id}/return`);
};

export const getTransfers = async (params) => {
  return apiClient.get('/transfers', { params });
};

export const createTransfer = async (data) => {
  return apiClient.post('/transfers', data);
};
