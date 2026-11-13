import type { Translations } from './locales/fr.js';

/** Key of a month name, from its index in the year (0 for January): `t(monthKey(index))`. */
export const monthKey = (index: number) =>
  `months.${index}` as `months.${Extract<keyof Translations['months'], string>}`;

/** Key of the name of a tariff kind: `t(tariffKindKey('feedIn'))`. */
export const tariffKindKey = <K extends Extract<keyof Translations['tariffs']['kinds'], string>>(
  kind: K,
) => `tariffs.kinds.${kind}` as const;

/** Key of the source of a resale estimate: `t(resaleBasisKey('lastYear'))`. */
export const resaleBasisKey = <
  B extends Extract<keyof Translations['savings']['resale']['basis'], string>,
>(
  basis: B,
) => `savings.resale.basis.${basis}` as const;
