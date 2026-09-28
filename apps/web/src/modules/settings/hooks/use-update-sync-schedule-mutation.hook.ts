import { getEnphaseGetSyncScheduleQueryKey, useEnphaseUpdateSyncSchedule } from '@repo/api-client';
import { useQueryClient } from '@tanstack/react-query';

export const useUpdateSyncScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useEnphaseUpdateSyncSchedule({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getEnphaseGetSyncScheduleQueryKey() });
      },
    },
  });
};
