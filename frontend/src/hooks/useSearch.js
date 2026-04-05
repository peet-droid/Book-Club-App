import { useQuery } from '@tanstack/react-query';
import * as api from '../api/search';

export const useBookSearch = (params) => {
  return useQuery({
    queryKey: ['search', 'books', params],
    queryFn: () => api.searchBooks(params),
    // Search may sometimes not run if there are no params (or maybe it returns all)
    // we assume we only enable if there's at least some param or we want default list
    keepPreviousData: true,
  });
};

export const useWhoHasSearch = (title) => {
  return useQuery({
    queryKey: ['search', 'who-has', title],
    queryFn: () => api.searchWhoHas(title),
    enabled: !!title && title.length > 2, // only search if title has some length
  });
};
