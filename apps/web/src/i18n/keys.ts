import type { Translations } from './locales/fr.js';

/** Key of a month name, from its index in the year (0 for January): `t(monthKey(index))`. */
export const monthKey = (index: number) =>
  `months.${index}` as `months.${Extract<keyof Translations['months'], string>}`;
