import { Sun } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { useHistoryData } from '../history/hooks/use-history-data.hook.js';
import { DashboardContent } from './components/dashboard-content.js';
import { HomePageSkeleton } from './components/home-page-skeleton.js';
import { PageHeader } from '../layout/components/page-header.js';

export const HomePage: FunctionComponent = () => {
  const { t } = useTranslation();
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
