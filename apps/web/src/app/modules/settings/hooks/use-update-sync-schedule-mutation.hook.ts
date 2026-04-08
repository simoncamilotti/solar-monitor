import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncKey } from '../sync.key';
import { SyncService } from '../sync.service';

export const useUpdateSyncScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (syncTime: string) => SyncService.updateSchedule(syncTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncKey.schedule });
    },
  });
};
