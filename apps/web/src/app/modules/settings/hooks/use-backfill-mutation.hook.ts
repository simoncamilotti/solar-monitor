import { useMutation, useQueryClient } from '@tanstack/react-query';

import { historyKey } from '../../history/history.key';
import { syncKey } from '../sync.key';
import { SyncService } from '../sync.service';

export const useBackfillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ systemId, startDate, endDate }: { systemId: number; startDate: string; endDate: string }) =>
      SyncService.triggerBackfill(systemId, startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncKey.status });
      queryClient.invalidateQueries({ queryKey: historyKey.getAll });
    },
  });
};
