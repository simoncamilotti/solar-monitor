import '@/i18n';

import i18n from 'i18next';

// Force French in test environment (navigator.language defaults to 'en' in jsdom)
i18n.changeLanguage('fr');
