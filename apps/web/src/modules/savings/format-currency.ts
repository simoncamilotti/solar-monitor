/** Euros in the conventions of the language: `1 234,56 €` in French, `€1,234.56` in English. */
export const formatEuros = (amount: number, language: string, fractionDigits = 2): string =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);

/** A tariff in euros, with the decimals it was entered with (up to five): `0,2516 €`. */
export const formatTariffPrice = (price: number, language: string): string =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  }).format(price);
