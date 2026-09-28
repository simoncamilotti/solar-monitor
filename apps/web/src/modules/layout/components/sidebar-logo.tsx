import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

import { Braces } from '../../ui/braces.js';

export const SidebarLogo: FunctionComponent = () => {
  const { t } = useTranslation('web');
  const profile = useAuth().user?.profile;
  const username = `${profile?.given_name ?? ''} ${profile?.family_name ?? ''}`;

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
