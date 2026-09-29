import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en.js';
import { fr, type Translations } from './locales/fr.js';

export const LANGUAGES = ['fr', 'en'] as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    // Typed keys: `t('greeting.title')` compiles, a misspelt key does not.
    resources: { translation: Translations };
  }
}

await i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { fr: { translation: fr }, en: { translation: en } },
    supportedLngs: LANGUAGES,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

document.documentElement.lang = i18n.resolvedLanguage ?? 'fr';
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
});

export { i18n };
