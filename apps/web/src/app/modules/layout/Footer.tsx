import type { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const Footer: FunctionComponent = () => {
  const { t } = useTranslation('common');

  return (
    <footer className="border-t border-border/50 py-10 no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[13px] text-muted-foreground">
        <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
        <span>
          <Trans i18nKey="footer.madeWith" ns="common" components={{ heart: <span className="text-primary" /> }} />
        </span>
      </div>
    </footer>
  );
};
