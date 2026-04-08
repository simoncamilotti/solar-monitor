import { Clock, Loader2, Save } from 'lucide-react';
import { type FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSyncSchedule } from '../hooks/use-sync-schedule.hook';
import { useUpdateSyncScheduleMutation } from '../hooks/use-update-sync-schedule-mutation.hook';

export const SyncScheduleCard: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const { data, isPending, isError } = useSyncSchedule();
  const mutation = useUpdateSyncScheduleMutation();
  const [syncTime, setSyncTime] = useState('02:00');

  useEffect(() => {
    if (data?.syncTime) {
      setSyncTime(data.syncTime);
    }
  }, [data?.syncTime]);

  const handleSave = () => {
    mutation.mutate(syncTime, {
      onSuccess: () => toast.success(t('syncSchedule.success')),
      onError: () => toast.error(t('syncSchedule.error')),
    });
  };

  const hasChanged = data?.syncTime !== syncTime;

  if (isPending) {
    return (
      <div className="space-y-3">
        <div>
          <div className="h-4 w-48 bg-muted animate-pulse rounded mb-1" />
          <div className="h-3 w-72 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground mb-1">{t('syncSchedule.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('syncSchedule.description')}</p>
      </div>

      {isError && <p className="text-destructive text-sm">{t('syncSchedule.loadError')}</p>}

      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <label htmlFor="sync-time" className="text-sm font-medium text-foreground">
            {t('syncSchedule.time')}
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="sync-time"
            type="time"
            value={syncTime}
            onChange={e => setSyncTime(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
          />
          <button
            onClick={handleSave}
            disabled={mutation.isPending || !hasChanged}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 rounded-lg border border-border bg-card"
          >
            {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {t('syncSchedule.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
