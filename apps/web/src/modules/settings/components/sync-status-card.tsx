import { format, subDays } from 'date-fns';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useBackfillMutation } from '../hooks/use-backfill-mutation.hook.js';
import { useEnphaseGetSyncStatus } from '@repo/api-client';
import { useTriggerSyncMutation } from '../hooks/use-trigger-sync-mutation.hook.js';
import { SyncStatusSkeleton } from './sync-status-skeleton.js';
import type { BackfillRange } from './sync-system-item.js';
import { SyncSystemItem } from './sync-system-item.js';

const BACKFILL_START_DATE = '2015-01-01';

export const SyncStatusCard: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const { data: systems, isPending, isError } = useEnphaseGetSyncStatus();
  const syncMutation = useTriggerSyncMutation();
  const backfillMutation = useBackfillMutation();

  const handleSync = (systemId: number) => {
    syncMutation.mutate(
      { data: { systemId } },
      {
        onSuccess: () => toast.success(t('sync.success')),
        onError: () => toast.error(t('sync.error')),
      },
    );
  };

  // With no range we import the whole history. With one, we fill a specific gap spotted by
  // `SyncSystemItem` — no need to re-import everything for 17 days.
  const handleBackfill = (systemId: number, range?: BackfillRange) => {
    const startDate = range?.startDate ?? BACKFILL_START_DATE;
    const endDate = range?.endDate ?? format(subDays(new Date(), 1), 'yyyy-MM-dd');
    backfillMutation.mutate(
      { data: { systemId, startDate, endDate } },
      {
        onSuccess: (data) =>
          toast.success(t('sync.backfillSuccess', { count: data.daysBackfilled })),
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
          {systems.map((system) => (
            <SyncSystemItem
              key={system.systemId}
              system={system}
              onSync={handleSync}
              isSyncing={
                syncMutation.isPending && syncMutation.variables?.data.systemId === system.systemId
              }
              onBackfill={handleBackfill}
              isBackfilling={
                backfillMutation.isPending &&
                backfillMutation.variables?.data.systemId === system.systemId
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
