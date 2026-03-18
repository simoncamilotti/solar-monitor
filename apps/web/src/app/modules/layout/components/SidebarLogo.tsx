import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { getAuthenticatedUsername } from '../../auth/auth';
import { Braces } from '../../ui/Braces';

export const SidebarLogo: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const username = getAuthenticatedUsername();

  return (
    <div className="p-6 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
        <Braces />
      </div>
      <div>
        <h1 className="text-sm font-semibold text-sidebar-foreground">{username}</h1>
        <p className="text-xs text-sidebar-muted">{t('sidebar.title')}</p>
      </div>
    </div>
  );
};
