import { Settings } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '../modules/layout/components/page-header.js';
import { SyncScheduleCard } from '../modules/settings/components/sync-schedule-card.js';
import { SyncStatusCard } from '../modules/settings/components/sync-status-card.js';

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
        <SyncScheduleCard />
      </div>
    </div>
  );
};
