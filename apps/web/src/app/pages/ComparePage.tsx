import { Sun } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { ComparisonContent } from '../modules/comparison/components/ComparisonContent';
import { ComparisonPageSkeleton } from '../modules/comparison/components/ComparisonPageSkeleton';
import { useHistoryData } from '../modules/history/hooks/use-history-data.hook';
import { PageHeader } from '../modules/layout/components/PageHeader';

export const ComparePage: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const { data, isPending, isError } = useHistoryData();

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col">
      <PageHeader
        title={t('compare.title')}
        description={t('compare.description')}
        icon={<Sun className="w-5 h-5 text-primary" />}
      />

      {isPending && <ComparisonPageSkeleton />}
      {isError && <p className="text-destructive text-sm">{t('compare.error')}</p>}
      {data && <ComparisonContent data={data} />}
    </div>
  );
};
