import { ShieldAlert } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { login } from '../modules/auth/auth';

export const ForbiddenPage: FunctionComponent = () => {
  const { t } = useTranslation('web');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4">
      <ShieldAlert className="w-12 h-12 text-destructive" />
      <h1 className="text-lg font-semibold text-foreground">{t('forbidden.title')}</h1>
      <p className="text-sm text-muted-foreground max-w-sm">{t('forbidden.description')}</p>
      <button
        onClick={() => login()}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {t('forbidden.retry')}
      </button>
    </div>
  );
};
