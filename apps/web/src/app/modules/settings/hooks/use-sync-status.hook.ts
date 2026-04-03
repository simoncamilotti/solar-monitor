import { useQuery } from '@tanstack/react-query';

import { syncKey } from '../sync.key';
import { SyncService } from '../sync.service';

export const useSyncStatus = () => {
  return useQuery({
    queryKey: syncKey.status,
    queryFn: SyncService.getStatus,
  });
};
