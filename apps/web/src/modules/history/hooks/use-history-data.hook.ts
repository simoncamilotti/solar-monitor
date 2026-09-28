import { useQuery } from '@tanstack/react-query';

import { historyKey } from '../history.key.js';
import { HistoryService } from '../history.service.js';

export const useHistoryData = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: historyKey.getAll,
    queryFn: HistoryService.getAll,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    data,
    isPending,
    isError,
  };
};
