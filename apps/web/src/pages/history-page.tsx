import '../modules/ui/ag-grid-setup.js';

import { Calendar, Download } from 'lucide-react';
import { type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExportModal } from '../modules/history/components/export-modal.js';
import { GridSkeleton } from '../modules/history/components/grid-skeleton.js';
import { HistoryGrid } from '../modules/history/components/history-grid.js';
import { useHistoryData } from '../modules/history/hooks/use-history-data.hook.js';
import { PageHeader } from '../modules/layout/components/page-header.js';

export const HistoryPage: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const { data, isPending, isError } = useHistoryData();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title={t('history.title')}
        description={t('history.description')}
        icon={<Calendar className="w-5 h-5 text-primary" />}
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

      {isPending && <GridSkeleton />}
      {isError && <p className="text-destructive text-sm">{t('history.error')}</p>}
      {data && <HistoryGrid data={data} />}

      {data && <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} data={data} />}
    </div>
  );
};
