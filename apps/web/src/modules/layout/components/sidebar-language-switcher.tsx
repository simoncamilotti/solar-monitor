import { Flag } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { LANGUAGES } from '../../../i18n/i18n.js';

export const SidebarLanguageSwitcher: FunctionComponent = () => {
  const { i18n, t } = useTranslation();
  // Two languages: the button offers the other one.
  const nextLanguage = LANGUAGES.find((language) => language !== i18n.language) ?? 'fr';

  const toggle = () => {
    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <div className="px-3 mb-2">
      <button
        onClick={toggle}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-smooth w-full"
      >
        <Flag className="w-4 h-4" />
        {t(`language.${nextLanguage}`)}
      </button>
    </div>
  );
};
