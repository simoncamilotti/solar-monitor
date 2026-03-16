import { zodResolver } from '@hookform/resolvers/zod';
import type { BaseSyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { FeatureFlagDto } from '@/shared-models';

import type { FeatureFlagForm } from '../feature-flag.type';
import { featureFlagFormSchema } from '../feature-flag.type';
import { useCreateFeatureFlagMutation } from './use-create-feature-flag-mutation.hook';

export type UseFeatureFlagFormProps = {
  existingFlags?: FeatureFlagDto[];
};

const defaultValues: FeatureFlagForm = {
  key: '',
};

export const useFeatureFlagForm = ({ existingFlags }: UseFeatureFlagFormProps) => {
  const { t } = useTranslation('web');

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isValid },
  } = useForm<FeatureFlagForm>({
    defaultValues: { ...defaultValues },
    resolver: zodResolver(featureFlagFormSchema),
    mode: 'onChange',
  });

  const { createFeatureFlagMutation } = useCreateFeatureFlagMutation();

  const onSubmit = async (data: FeatureFlagForm) => {
    const trimmed = data.key.trim();

    if (existingFlags?.some(f => f.key === trimmed)) {
      setError('key', { message: t('featureFlags.alreadyExists') });
      return;
    }

    try {
      await createFeatureFlagMutation.mutateAsync(trimmed);
      toast.success(t('featureFlags.created'));
      reset({ ...defaultValues });
    } catch {
      toast.error(t('featureFlags.createError'));
    }
  };

  return {
    control,
    isValid,
    isPending: createFeatureFlagMutation.isPending,
    onSubmit: (form: BaseSyntheticEvent) => handleSubmit(onSubmit)(form),
  };
};
