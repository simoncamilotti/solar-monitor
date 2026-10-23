import { addDays, format, parseISO } from 'date-fns';

import type { LifetimeDay, Tariff, TariffKind } from '@repo/contracts';

export type Savings = {
  /** Energy produced and used on site, valued at the purchase price: the bill it avoided. */
  savings: number;
  /** Energy sold to the grid, valued at the feed-in price. */
  revenue: number;
  total: number;
  /** Days valued without one of the two prices, because no tariff was in force yet. */
  unpricedDays: number;
};

/** Price in force on a day: the latest tariff of that kind that started on or before it. */
export const priceOn = (tariffs: Tariff[], kind: TariffKind, day: string): number | null => {
  let price: number | null = null;
  let since = '';
  for (const tariff of tariffs) {
    // `yyyy-MM-dd` strings sort like the days they name.
    if (tariff.kind === kind && tariff.effectiveFrom <= day && tariff.effectiveFrom >= since) {
      price = tariff.pricePerKwh;
      since = tariff.effectiveFrom;
    }
  }
  return price;
};

const valueOfDay = (day: LifetimeDay, tariffs: Tariff[]) => {
  const purchase = priceOn(tariffs, 'purchase', day.date);
  const feedIn = priceOn(tariffs, 'feedIn', day.date);
  const selfConsumed = Math.max(0, day.kwhProduced - day.kwhExported);
  return {
    savings: purchase === null ? 0 : selfConsumed * purchase,
    revenue: feedIn === null ? 0 : day.kwhExported * feedIn,
    priced: purchase !== null && feedIn !== null,
  };
};

/** Values each day at the tariffs in force that day. */
export const computeSavings = (days: LifetimeDay[], tariffs: Tariff[]): Savings => {
  let savings = 0;
  let revenue = 0;
  let unpricedDays = 0;
  for (const day of days) {
    const value = valueOfDay(day, tariffs);
    savings += value.savings;
    revenue += value.revenue;
    if (!value.priced) unpricedDays += 1;
  }
  return { savings, revenue, total: savings + revenue, unpricedDays };
};

export type InvestmentReturn = {
  /** Gain since the first stored day. */
  gained: number;
  /** Share of the cost already paid back, 0 to 1 (capped). */
  share: number;
  /** Day the gain reached, or should reach, the cost; `null` when nothing is gained. */
  paybackDay: string | null;
  paidBack: boolean;
};

/** Days of history the payback estimate averages over: a whole year, so seasons cancel out. */
const PACE_WINDOW_DAYS = 365;

/**
 * Measures the gain since commissioning against the cost of the installation, and estimates when
 * it pays for itself at the pace of the last year.
 */
export const computeInvestmentReturn = (
  days: LifetimeDay[],
  tariffs: Tariff[],
  cost: number,
): InvestmentReturn => {
  let gained = 0;
  let paybackDay: string | null = null;
  for (const day of days) {
    const value = valueOfDay(day, tariffs);
    gained += value.savings + value.revenue;
    if (paybackDay === null && gained >= cost) paybackDay = day.date;
  }

  const share = cost > 0 ? Math.min(1, gained / cost) : 1;
  if (paybackDay !== null || cost === 0) {
    return { gained, share, paybackDay: paybackDay ?? days[0]?.date ?? null, paidBack: true };
  }

  const lastDay = days.at(-1);
  const recent = days.slice(-PACE_WINDOW_DAYS);
  const dailyPace = recent.length > 0 ? computeSavings(recent, tariffs).total / recent.length : 0;
  if (!lastDay || dailyPace <= 0) {
    return { gained, share, paybackDay: null, paidBack: false };
  }

  const remainingDays = Math.ceil((cost - gained) / dailyPace);
  return {
    gained,
    share,
    paybackDay: format(addDays(parseISO(lastDay.date), remainingDays), 'yyyy-MM-dd'),
    paidBack: false,
  };
};
