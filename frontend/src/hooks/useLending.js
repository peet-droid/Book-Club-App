import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/lending';

export const useLendRequests = (params) => {
  return useQuery({
    queryKey: ['lend-requests', params],
    queryFn: () => api.getLendRequests(params),
  });
};

export const useCreateLendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createLendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useApproveLendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.approveLendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useRejectLendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.rejectLendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-requests'] });
    },
  });
};

export const useReturnLendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.returnLendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useTransfers = (params) => {
  return useQuery({
    queryKey: ['transfers', params],
    queryFn: () => api.getTransfers(params),
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
