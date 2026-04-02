import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enWeb from './locales/en/web.json';
import frWeb from './locales/fr/web.json';

const resources = {
  fr: { web: frWeb },
  en: { web: enWeb },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    defaultNS: 'web',
    interpolation: {
      escapeValue: false, // React already escapes rendered output — no double-escaping needed
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
