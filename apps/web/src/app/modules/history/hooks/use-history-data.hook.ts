import { useQuery } from '@tanstack/react-query';

import { historyKey } from '../history.key';
import { HistoryService } from '../history.service';

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
