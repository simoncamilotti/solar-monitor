import { Sun } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { useHistoryData } from '../modules/history/hooks/use-history-data.hook';
import { DashboardContent } from '../modules/home/components/DashboardContent';
import { HomePageSkeleton } from '../modules/home/components/HomePageSkeleton';
import { PageHeader } from '../modules/layout/components/PageHeader';

export const HomePage: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const { data, isPending, isError } = useHistoryData();

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col">
      <PageHeader
        title={t('home.title')}
        description={t('home.description')}
        icon={<Sun className="w-5 h-5 text-primary" />}
      />

      {isPending && <HomePageSkeleton />}
      {isError && <p className="text-destructive text-sm">{t('home.error')}</p>}
      {data && <DashboardContent data={data} />}
    </div>
  );
};
