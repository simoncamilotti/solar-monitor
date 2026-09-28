import { useQuery } from '@tanstack/react-query';

import { syncKey } from '../sync.key.js';
import { SyncService } from '../sync.service.js';

export const useSyncSchedule = () => {
  return useQuery({
    queryKey: syncKey.schedule,
    queryFn: SyncService.getSchedule,
  });
};
