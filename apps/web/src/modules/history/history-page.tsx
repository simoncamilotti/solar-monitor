import '../ui/ag-grid-setup.js';

import { Calendar, Download } from 'lucide-react';
import { type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ProductionCalendar } from './calendar/production-calendar.js';
import { ExportModal } from './components/export-modal.js';
import { GridSkeleton } from './components/grid-skeleton.js';
import { HistoryGrid } from './components/history-grid.js';
import { useHistoryData } from './hooks/use-history-data.hook.js';
import { type HistoryView, HISTORY_VIEWS } from './history-view.type.js';
import { PageHeader } from '../layout/components/page-header.js';

type HistoryPageProps = {
  view?: HistoryView;
  onViewChange?: (view: HistoryView) => void;
};

export const HistoryPage: FunctionComponent<HistoryPageProps> = ({
  view = 'table',
  onViewChange,
}) => {
  const { t } = useTranslation();
  const { data, isPending, isError } = useHistoryData();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title={t('history.title')}
        description={t('history.description')}
        icon={<Calendar className="w-5 h-5 text-primary-text" />}
        action={{
          label: t('export.export'),
          icon: <Download className="w-4 h-4" />,
          onClick: () => setExportOpen(true),
          disabled: !data,
        }}
        trailing={
          data ? (
            <span className="text-xs text-muted-foreground">
              {data.length} {t('export.records')}
            </span>
          ) : undefined
        }
      />

      <div
        role="group"
        aria-label={t('history.views.label')}
        className="mb-4 inline-flex gap-1 rounded-xl bg-muted p-1"
      >
        {HISTORY_VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => onViewChange?.(v)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-smooth ${
              view === v
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`history.views.${v}`)}
          </button>
        ))}
      </div>

      {isPending && <GridSkeleton />}
      {isError && <p className="text-destructive text-sm">{t('history.error')}</p>}
      {data && view === 'table' && <HistoryGrid data={data} />}
      {data && view === 'calendar' && <ProductionCalendar data={data} />}

      {data && <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} data={data} />}
    </div>
  );
};
