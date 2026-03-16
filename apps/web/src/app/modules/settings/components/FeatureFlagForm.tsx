import { Loader2, Plus } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { FeatureFlagDto } from '@/shared-models';

import { useFeatureFlagForm } from '../hooks/use-feature-flag-form.hook';

type FeatureFlagFormProps = {
  existingFlags?: FeatureFlagDto[];
};

export const FeatureFlagForm: FunctionComponent<FeatureFlagFormProps> = ({ existingFlags }) => {
  const { t } = useTranslation('web');
  const { control, isValid, isPending, onSubmit } = useFeatureFlagForm({ existingFlags });

  return (
    <form onSubmit={onSubmit} className="space-y-1">
      <div className="flex items-center gap-2">
        <Controller
          name="key"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder={t('featureFlags.placeholder')}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          )}
        />
        <button
          type="submit"
          disabled={!isValid || isPending}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {t('featureFlags.add')}
        </button>
      </div>
      <Controller
        name="key"
        control={control}
        render={({ fieldState }) =>
          fieldState.error ? (
            <p className="text-[11px] text-destructive">{fieldState.error.message}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">{t('featureFlags.keyHint')}</p>
          )
        }
      />
    </form>
  );
};
