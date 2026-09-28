import { useQuery } from '@tanstack/react-query';

import { syncKey } from '../sync.key.js';
import { SyncService } from '../sync.service.js';

export const useSyncStatus = () => {
  return useQuery({
    queryKey: syncKey.status,
    queryFn: SyncService.getStatus,
  });
};
