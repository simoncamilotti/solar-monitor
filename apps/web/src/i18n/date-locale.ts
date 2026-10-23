import { enUS, fr, type Locale } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

/** The `date-fns` locale of the interface language, for formatted dates and date pickers. */
const getDateLocale = (language: string | undefined): Locale => (language === 'en' ? enUS : fr);

export const useDateLocale = (): Locale => getDateLocale(useTranslation().i18n.language);
