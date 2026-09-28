import '../i18n/init-i18n.js';

import i18n from 'i18next';

// Force French in test environment (navigator.language defaults to 'en' in jsdom)
i18n.changeLanguage('fr');
