import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { FeatureFlagDto } from '@/shared-models';

import { featureFlagsKey } from '../feature-flags.key';
import { FeatureFlagsService } from '../feature-flags.service';

export const useCreateFeatureFlagMutation = () => {
  const queryClient = useQueryClient();

  const createFeatureFlagMutation = useMutation({
    mutationFn: (key: string) => FeatureFlagsService.create(key, false),
    onSuccess: (created: FeatureFlagDto) => {
      queryClient.setQueryData<FeatureFlagDto[]>(featureFlagsKey.getAll, data => [...(data ?? []), created]);
    },
  });

  return { createFeatureFlagMutation };
};
