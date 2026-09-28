import { Flag } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

export const SidebarLanguageSwitcher: FunctionComponent = () => {
  const { i18n, t } = useTranslation('web');
  const currentLang = i18n.language;

  const toggle = () => {
    i18n.changeLanguage(currentLang === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="px-3 mb-2">
      <button
        onClick={toggle}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-smooth w-full"
      >
        <Flag className="w-4 h-4" />
        {currentLang === 'fr' ? t('language.en') : t('language.fr')}
      </button>
    </div>
  );
};
