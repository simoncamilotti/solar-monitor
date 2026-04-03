import { useMutation, useQueryClient } from '@tanstack/react-query';

import { historyKey } from '../../history/history.key';
import { syncKey } from '../sync.key';
import { SyncService } from '../sync.service';

export const useTriggerSyncMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (systemId: number) => SyncService.triggerSync(systemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncKey.status });
      queryClient.invalidateQueries({ queryKey: historyKey.getAll });
    },
  });
};
