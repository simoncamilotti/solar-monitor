import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { Database, Loader2, RefreshCw } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import type { SyncStatusDto } from '@/shared-models';

export const SyncSystemItem: FunctionComponent<{
  system: SyncStatusDto;
  onSync: (systemId: number) => void;
  isSyncing: boolean;
}> = ({ system, onSync, isSyncing }) => {
  const { t, i18n } = useTranslation('web');
  const locale = i18n.language === 'fr' ? fr : enUS;

  const lastSyncLabel = system.lastSyncDate
    ? formatDistanceToNow(new Date(system.lastSyncDate), { addSuffix: true, locale })
    : t('sync.never');

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card">
      <div className="flex items-center gap-3">
        <Database className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">
            {t('sync.system')} #{system.systemId}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('sync.lastSync')}: {lastSyncLabel}
            <span className="mx-1.5">·</span>
            {system.totalRecords} {t('sync.records')}
          </p>
        </div>
      </div>

      <button
        onClick={() => onSync(system.systemId)}
        disabled={isSyncing}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
      >
        {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        {t('sync.trigger')}
      </button>
    </div>
  );
};
