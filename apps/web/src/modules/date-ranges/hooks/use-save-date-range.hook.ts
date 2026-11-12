import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ApiError } from '@repo/api-client';
import { dateRangeCreateSchema } from '@repo/contracts';

import { useCreateDateRangeMutation } from './use-date-range-mutations.hook.js';

type SaveInput = { name: string; startDate: string | null; endDate: string | null };

/** Saves a named range to the library, with a toast for the outcome. */
export const useSaveDateRange = () => {
  const { t } = useTranslation();
  const mutation = useCreateDateRangeMutation();

  const canSave = (input: SaveInput) => dateRangeCreateSchema.safeParse(input).success;

  const save = (input: SaveInput, onSaved?: () => void) => {
    const parsed = dateRangeCreateSchema.safeParse(input);
    if (!parsed.success) return;
    mutation.mutate(
      { data: parsed.data },
      {
        onSuccess: () => {
          toast.success(t('savedRanges.saveSuccess', { name: parsed.data.name }));
          onSaved?.();
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError && error.status === 409
              ? t('savedRanges.duplicate')
              : t('savedRanges.saveError'),
          ),
      },
    );
  };

  return { save, canSave, isPending: mutation.isPending };
};
