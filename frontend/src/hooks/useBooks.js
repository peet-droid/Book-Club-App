import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/books';

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: api.getBooks,
  });
};

export const useBook = (id) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => api.getBook(id),
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateBook,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books', variables.id] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
