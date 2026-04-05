import { apiClient } from './client';

export const getGroups = async () => {
  return apiClient.get('/groups');
};

export const getGroup = async (id) => {
  return apiClient.get(`/groups/${id}`);
};

export const createGroup = async (data) => {
  return apiClient.post('/groups', data);
};

export const updateGroup = async ({ id, data, admin_id }) => {
  return apiClient.put(`/groups/${id}?admin_id=${admin_id}`, data);
};

export const deleteGroup = async ({ id, admin_id }) => {
  return apiClient.delete(`/groups/${id}?admin_id=${admin_id}`);
};

export const joinGroup = async ({ id, member_id }) => {
  return apiClient.post(`/groups/${id}/members`, { member_id });
};

export const leaveGroup = async ({ id, member_id }) => {
  return apiClient.delete(`/groups/${id}/members/${member_id}`);
};

export const getGroupPosts = async (groupId) => {
  return apiClient.get(`/groups/${groupId}/posts`);
};

export const createPost = async ({ groupId, data }) => {
  return apiClient.post(`/groups/${groupId}/posts`, data);
};

export const deletePost = async ({ groupId, postId, deleter_id }) => {
  return apiClient.delete(`/groups/${groupId}/posts/${postId}?deleter_id=${deleter_id}`);
};
