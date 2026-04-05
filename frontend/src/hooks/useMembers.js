import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/members';

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: api.getMembers,
  });
};

export const useMember = (id) => {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => api.getMember(id),
    enabled: !!id,
  });
};

export const useMemberBooks = (id) => {
  return useQuery({
    queryKey: ['members', id, 'books'],
    queryFn: () => api.getMemberBooks(id),
    enabled: !!id,
  });
};

export const useMemberGroups = (id) => {
  return useQuery({
    queryKey: ['members', id, 'groups'],
    queryFn: () => api.getMemberGroups(id),
    enabled: !!id,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateMember,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', variables.id] });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
