import '../modules/ui/ag-grid-setup';

import { Calendar } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { GridSkeleton } from '../modules/history/components/GridSkeleton';
import { HistoryGrid } from '../modules/history/components/HistoryGrid';
import { useHistoryData } from '../modules/history/hooks/use-history-data.hook';
import { PageHeader } from '../modules/layout/components/PageHeader';

export const HistoryPage: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const { data, isPending, isError } = useHistoryData();

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title={t('history.title')}
        description={t('history.description')}
        icon={<Calendar className="w-5 h-5 text-primary" />}
      />

      {isPending && <GridSkeleton />}
      {isError && <p className="text-destructive text-sm">{t('history.error')}</p>}
      {data && <HistoryGrid data={data} />}
    </div>
  );
};
