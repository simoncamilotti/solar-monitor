import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from '../locales/en/common.json';
import enWeb from '../locales/en/web.json';
import frCommon from '../locales/fr/common.json';
import frWeb from '../locales/fr/web.json';

const resources = {
  fr: { common: frCommon, web: frWeb },
  en: { common: enCommon, web: enWeb },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes rendered output — no double-escaping needed
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
