import { useMutation, useQueryClient } from '@tanstack/react-query';

import { historyKey } from '../../history/history.key.js';
import { syncKey } from '../sync.key.js';
import { SyncService } from '../sync.service.js';

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
