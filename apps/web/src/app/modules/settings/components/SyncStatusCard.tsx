import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSyncStatus } from '../hooks/use-sync-status.hook';
import { useTriggerSyncMutation } from '../hooks/use-trigger-sync-mutation.hook';
import { SyncStatusSkeleton } from './SyncStatusSkeleton';
import { SyncSystemItem } from './SyncSystemItem';

export const SyncStatusCard: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const { data: systems, isPending, isError } = useSyncStatus();
  const syncMutation = useTriggerSyncMutation();

  const handleSync = (systemId: number) => {
    syncMutation.mutate(systemId, {
      onSuccess: () => {
        toast.success(t('sync.success'));
      },
      onError: () => {
        toast.error(t('sync.error'));
      },
    });
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
