import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: FunctionComponent = () => {
  const { i18n, t } = useTranslation('common');
  const currentLang = i18n.language;

  const toggle = () => {
    i18n.changeLanguage(currentLang === 'fr' ? 'en' : 'fr');
  };

  return (
    <button
      onClick={toggle}
      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md border border-border/50 hover:border-border"
    >
      {currentLang === 'fr' ? t('language.en') : t('language.fr')}
    </button>
  );
};
