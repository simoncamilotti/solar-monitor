import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ChevronDown, Database, History, Loader2, RefreshCw } from 'lucide-react';
import { type FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SyncStatusDto } from '@/shared-models';

const buttonClasses =
  'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50';

export const SyncSystemItem: FunctionComponent<{
  system: SyncStatusDto;
  onSync: (systemId: number) => void;
  isSyncing: boolean;
  onBackfill: (systemId: number) => void;
  isBackfilling: boolean;
}> = ({ system, onSync, isSyncing, onBackfill, isBackfilling }) => {
  const { t, i18n } = useTranslation('web');
  const locale = i18n.language === 'fr' ? fr : enUS;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDisabled = isSyncing || isBackfilling;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const lastSyncLabel = system.lastSyncDate
    ? formatDistanceToNow(new Date(system.lastSyncDate), { addSuffix: true, locale })
    : t('sync.never');

  const showSplitButton = system.totalRecords === 0;

  const spinnerIcon = isBackfilling ? (
    <Loader2 className="w-3.5 h-3.5 animate-spin" />
  ) : isSyncing ? (
    <Loader2 className="w-3.5 h-3.5 animate-spin" />
  ) : (
    <RefreshCw className="w-3.5 h-3.5" />
  );

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

      {showSplitButton ? (
        <div ref={containerRef} className="relative">
          <div className="inline-flex items-center rounded-lg border border-border bg-card">
            <button
              onClick={() => onSync(system.systemId)}
              disabled={isDisabled}
              className={`${buttonClasses} rounded-l-lg`}
            >
              {spinnerIcon}
              {t('sync.trigger')}
            </button>
            <div className="w-px h-5 bg-border" />
            <button
              onClick={() => setOpen(prev => !prev)}
              disabled={isDisabled}
              className={`${buttonClasses} rounded-r-lg px-2`}
              aria-label="More sync options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-border bg-card shadow-lg">
              <button
                onClick={() => {
                  onBackfill(system.systemId);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors rounded-lg"
              >
                <History className="w-3.5 h-3.5" />
                {t('sync.backfill')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => onSync(system.systemId)}
          disabled={isDisabled}
          className={`${buttonClasses} rounded-lg border border-border bg-card`}
        >
          {spinnerIcon}
          {t('sync.trigger')}
        </button>
      )}
    </div>
  );
};
