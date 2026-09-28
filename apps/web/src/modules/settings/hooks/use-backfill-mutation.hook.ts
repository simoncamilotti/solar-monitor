import {
  getEnphaseGetAllQueryKey,
  getEnphaseGetSyncStatusQueryKey,
  useEnphaseBackfill,
} from '@repo/api-client';
import { useQueryClient } from '@tanstack/react-query';

export const useBackfillMutation = () => {
  const queryClient = useQueryClient();

  return useEnphaseBackfill({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getEnphaseGetSyncStatusQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getEnphaseGetAllQueryKey() });
      },
    },
  });
};
