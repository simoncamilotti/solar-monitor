import { formatEuros, formatTariffPrice } from './format-currency.js';

// Intl separates French thousands and the symbol with narrow and plain no-break spaces.
const normalizeSpaces = (text: string) => text.replace(/\s/g, ' ');

describe('formatEuros', () => {
  it('should follow French conventions', () => {
    expect(normalizeSpaces(formatEuros(1234.56, 'fr'))).toBe('1 234,56 €');
  });

  it('should follow English conventions', () => {
    expect(formatEuros(1234.56, 'en')).toBe('€1,234.56');
  });

  it('should round to the requested digits', () => {
    expect(formatEuros(9500.4, 'en', 0)).toBe('€9,500');
  });
});

describe('formatTariffPrice', () => {
  it('should keep the decimals of the tariff', () => {
    expect(normalizeSpaces(formatTariffPrice(0.2516, 'fr'))).toBe('0,2516 €');
    expect(formatTariffPrice(0.1, 'en')).toBe('€0.10');
  });
});
