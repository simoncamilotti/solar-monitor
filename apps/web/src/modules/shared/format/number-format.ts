type EnergyUnit = 'kWh' | 'MWh';

/** An energy split for display: the number and its unit, rendered apart in the KPI cards. */
export type EnergyParts = { value: string; unit: EnergyUnit };

/** A single unit for every value of a chart, so that its axis and tooltips agree. */
export type EnergyScale = { unit: EnergyUnit; factor: number };

const MWH_THRESHOLD = 1000;

/**
 * A number in the conventions of the language, with a fixed number of decimals:
 * `1 234,5` in French, `1,234.5` in English.
 */
export const formatNumber = (value: number, language: string, fractionDigits = 1): string =>
  new Intl.NumberFormat(language, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

/** A percentage given from 0 to 100: `12,3 %` in French, `12.3%` in English. */
export const formatPercent = (value: number, language: string, fractionDigits = 1): string =>
  new Intl.NumberFormat(language, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);

/** An energy in kWh, switched to MWh with two decimals from 1 000 kWh. */
export const energyParts = (kwh: number, language: string): EnergyParts =>
  Math.abs(kwh) >= MWH_THRESHOLD
    ? { value: formatNumber(kwh / 1000, language, 2), unit: 'MWh' }
    : { value: formatNumber(kwh, language, 1), unit: 'kWh' };

/** An energy in kWh as one string: `12,35 MWh`, `842,1 kWh`. */
export const formatEnergy = (kwh: number, language: string): string => {
  const { value, unit } = energyParts(kwh, language);
  return `${value}\u00a0${unit}`;
};

/** The unit of a chart, from the largest value it draws. */
export const energyScale = (values: number[]): EnergyScale =>
  Math.max(0, ...values.map(Math.abs)) >= MWH_THRESHOLD
    ? { unit: 'MWh', factor: 1000 }
    : { unit: 'kWh', factor: 1 };

/** A value of a chart in the scale's unit: two decimals in MWh, one in kWh. */
export const formatScaled = (kwh: number, scale: EnergyScale, language: string): string =>
  `${formatNumber(kwh / scale.factor, language, scale.unit === 'MWh' ? 2 : 1)}\u00a0${scale.unit}`;

/** A tick of a chart axis in the scale's unit, without trailing zeros: `1,5`, `250`. */
export const formatAxisValue = (kwh: number, scale: EnergyScale, language: string): string =>
  new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(kwh / scale.factor);
