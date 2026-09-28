import {
  getEnphaseGetAllQueryKey,
  getEnphaseGetSyncStatusQueryKey,
  useEnphaseTriggerSync,
} from '@repo/api-client';
import { useQueryClient } from '@tanstack/react-query';

export const useTriggerSyncMutation = () => {
  const queryClient = useQueryClient();

  return useEnphaseTriggerSync({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getEnphaseGetSyncStatusQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getEnphaseGetAllQueryKey() });
      },
    },
  });
};
