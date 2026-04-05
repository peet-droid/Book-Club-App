import { useQuery } from '@tanstack/react-query';
import { checkHealth } from '../api/health';

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    retry: false, // Don't retry indefinitely if backend is down
  });
}
