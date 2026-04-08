import { format, subDays } from 'date-fns';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useBackfillMutation } from '../hooks/use-backfill-mutation.hook';
import { useSyncStatus } from '../hooks/use-sync-status.hook';
import { useTriggerSyncMutation } from '../hooks/use-trigger-sync-mutation.hook';
import { SyncStatusSkeleton } from './SyncStatusSkeleton';
import { SyncSystemItem } from './SyncSystemItem';

const BACKFILL_START_DATE = '2015-01-01';

export const SyncStatusCard: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const { data: systems, isPending, isError } = useSyncStatus();
  const syncMutation = useTriggerSyncMutation();
  const backfillMutation = useBackfillMutation();

  const handleSync = (systemId: number) => {
    syncMutation.mutate(systemId, {
      onSuccess: () => toast.success(t('sync.success')),
      onError: () => toast.error(t('sync.error')),
    });
  };

  const handleBackfill = (systemId: number) => {
    const endDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    backfillMutation.mutate(
      { systemId, startDate: BACKFILL_START_DATE, endDate },
      {
        onSuccess: data => toast.success(t('sync.backfillSuccess', { count: data.daysBackfilled })),
        onError: () => toast.error(t('sync.backfillError')),
      },
    );
  };

  if (isPending) {
    return <SyncStatusSkeleton />;
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground mb-1">{t('sync.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('sync.description')}</p>
      </div>

      {isError && <p className="text-destructive text-sm">{t('sync.loadError')}</p>}

      {systems && systems.length === 0 && (
        <p className="text-center py-6 text-muted-foreground text-sm">{t('sync.noSystems')}</p>
      )}

      {systems && systems.length > 0 && (
        <div className="space-y-2">
          {systems.map(system => (
            <SyncSystemItem
              key={system.systemId}
              system={system}
              onSync={handleSync}
              isSyncing={syncMutation.isPending && syncMutation.variables === system.systemId}
              onBackfill={handleBackfill}
              isBackfilling={backfillMutation.isPending && backfillMutation.variables?.systemId === system.systemId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
