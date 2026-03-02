import { useQuery } from '@tanstack/react-query';
import { searchService, type SearchParams } from '@/lib/api/services/search.service';

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchService.search(params),
    enabled: params.q.trim().length > 0,
    staleTime: 10 * 1000,
  });
}
