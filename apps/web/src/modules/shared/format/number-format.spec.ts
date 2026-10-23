import { describe, expect, it } from 'vitest';

import {
  energyParts,
  energyScale,
  formatAxisValue,
  formatEnergy,
  formatNumber,
  formatPercent,
  formatScaled,
} from './number-format.js';

// Intl separates thousands with a narrow no-break space in French and puts a no-break space
// before the units.
const normalize = (text: string) => text.replace(/[\u202f\u00a0]/g, ' ');

describe('formatNumber', () => {
  it('groups thousands in the conventions of the language', () => {
    expect(normalize(formatNumber(1234.56, 'fr'))).toBe('1 234,6');
    expect(formatNumber(1234.56, 'en')).toBe('1,234.6');
  });

  it('keeps the requested decimals', () => {
    expect(formatNumber(3, 'en', 2)).toBe('3.00');
    expect(formatNumber(12345.678, 'en', 0)).toBe('12,346');
  });
});

describe('formatPercent', () => {
  it('formats a value given from 0 to 100', () => {
    expect(normalize(formatPercent(45.25, 'fr'))).toBe('45,3 %');
    expect(formatPercent(45.25, 'en')).toBe('45.3%');
  });
});

describe('energyParts', () => {
  it('stays in kWh below 1 000 kWh', () => {
    expect(energyParts(999.94, 'en')).toEqual({ value: '999.9', unit: 'kWh' });
  });

  it('switches to MWh from 1 000 kWh', () => {
    expect(energyParts(1000, 'en')).toEqual({ value: '1.00', unit: 'MWh' });
    expect(normalize(energyParts(12345.6, 'fr').value)).toBe('12,35');
    expect(energyParts(1234567, 'en')).toEqual({ value: '1,234.57', unit: 'MWh' });
  });

  it('applies the threshold to negative values too', () => {
    expect(energyParts(-1500, 'en')).toEqual({ value: '-1.50', unit: 'MWh' });
  });
});

describe('formatEnergy', () => {
  it('joins the value and its unit', () => {
    expect(normalize(formatEnergy(842.06, 'fr'))).toBe('842,1 kWh');
    expect(normalize(formatEnergy(12345.6, 'en'))).toBe('12.35 MWh');
  });
});

describe('energyScale', () => {
  it('picks the unit from the largest value', () => {
    expect(energyScale([12, 999])).toEqual({ unit: 'kWh', factor: 1 });
    expect(energyScale([12, 4200])).toEqual({ unit: 'MWh', factor: 1000 });
    expect(energyScale([-1200, 10])).toEqual({ unit: 'MWh', factor: 1000 });
    expect(energyScale([])).toEqual({ unit: 'kWh', factor: 1 });
  });

  it('formats every value of the chart in that unit', () => {
    const scale = energyScale([4200]);
    expect(normalize(formatScaled(350, scale, 'fr'))).toBe('0,35 MWh');
    expect(normalize(formatScaled(350, energyScale([350]), 'en'))).toBe('350.0 kWh');
  });
});

describe('formatAxisValue', () => {
  it('drops trailing zeros and groups thousands', () => {
    expect(formatAxisValue(1500, energyScale([4200]), 'en')).toBe('1.5');
    expect(normalize(formatAxisValue(2500, energyScale([999]), 'fr'))).toBe('2 500');
  });
});
