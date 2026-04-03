import { Settings } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '../modules/layout/components/PageHeader';
import { FeatureFlagList } from '../modules/settings/components/FeatureFlagList';
import { SyncStatusCard } from '../modules/settings/components/SyncStatusCard';

export const SettingsPage: FunctionComponent = () => {
  const { t } = useTranslation('web');

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col">
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
        icon={<Settings className="w-5 h-5 text-primary" />}
      />

      <div className="space-y-8">
        <SyncStatusCard />
        <FeatureFlagList />
      </div>
    </div>
  );
};
