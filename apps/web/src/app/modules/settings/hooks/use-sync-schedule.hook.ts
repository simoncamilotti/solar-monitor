import { useQuery } from '@tanstack/react-query';

import { syncKey } from '../sync.key';
import { SyncService } from '../sync.service';

export const useSyncSchedule = () => {
  return useQuery({
    queryKey: syncKey.schedule,
    queryFn: SyncService.getSchedule,
  });
};
