import { fireEvent, render, screen } from '@testing-library/react';
import { type FunctionComponent, useState } from 'react';

import type { LifetimeDay, Tariff } from '@repo/contracts';

import { ResaleEstimateCard } from './resale-estimate-card.js';

const day = (date: string, kwhExported = 2): LifetimeDay => ({
  date,
  kwhProduced: 10,
  kwhConsumed: 8,
  kwhImported: 2,
  kwhExported,
  gridDependency: 25,
});

const range = (from: string, to: string, kwhExported = 2): LifetimeDay[] => {
  const days: LifetimeDay[] = [];
  for (
    let date = new Date(`${from}T00:00:00Z`);
    date <= new Date(`${to}T00:00:00Z`);
    date = new Date(date.getTime() + 86_400_000)
  ) {
    days.push(day(date.toISOString().slice(0, 10), kwhExported));
  }
  return days;
};

const feedIn: Tariff = {
  id: '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11',
  kind: 'feedIn',
  pricePerKwh: 0.1,
  effectiveFrom: '2023-01-01',
};

// Periods start on 3 March. The history covers 2024-09-01 to 2026-06-10, so the oldest period
// shown is the one that started in 2024 and the current one started in 2026.
const data = range('2024-09-01', '2026-06-10');
const today = '2026-06-11';

/** Holds the period year the way the route does, in the URL. */
const Harness: FunctionComponent<{ initialYear?: number; days?: LifetimeDay[]; at?: string }> = ({
  initialYear,
  days = data,
  at = today,
}) => {
  const [year, setYear] = useState(initialYear);
  return (
    <ResaleEstimateCard
      data={days}
      tariffs={[feedIn]}
      billingStart="2023-03-03"
      year={year}
      onYearChange={setYear}
      today={at}
    />
  );
};

describe('ResaleEstimateCard', () => {
  it('should show the current period with its estimate and progress', () => {
    render(<Harness />);

    expect(screen.getByText('3 mars 2026 → 2 mars 2027')).toBeDefined();
    expect(screen.getByText('Estimation à l’échéance')).toBeDefined();
    // 100 days gone, 265 left.
    expect(screen.getByText('100 jours écoulés, 265 restants')).toBeDefined();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    expect(screen.queryByRole('button', { name: 'Période en cours' })).toBeNull();
  });

  it('should go back to a finished period and show its final amount', () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Période précédente' }));

    expect(screen.getByText('3 mars 2025 → 2 mars 2026')).toBeDefined();
    expect(screen.getByText('Montant de la période')).toBeDefined();
    // 365 days at 2 kWh and 0.10 €.
    expect(screen.getByText(/73,00\s€/)).toBeDefined();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText(/restants/)).toBeNull();
  });

  it('should come back to the current period in a click', () => {
    render(<Harness initialYear={2025} />);

    fireEvent.click(screen.getByRole('button', { name: 'Période en cours' }));

    expect(screen.getByText('3 mars 2026 → 2 mars 2027')).toBeDefined();
  });

  it('should disable next on the current period and previous on the oldest one', () => {
    render(<Harness />);

    expect(
      (screen.getByRole('button', { name: 'Période suivante' }) as HTMLButtonElement).disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Période précédente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Période précédente' }));

    expect(screen.getByText('3 mars 2024 → 2 mars 2025')).toBeDefined();
    expect(
      (screen.getByRole('button', { name: 'Période précédente' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('should fall back on the current period for a year out of bounds', () => {
    render(<Harness initialYear={2019} />);

    expect(screen.getByText('3 mars 2026 → 2 mars 2027')).toBeDefined();
  });

  it('should flag a period whose history starts late as partial', () => {
    render(<Harness initialYear={2024} />);

    // The history starts on 2024-09-01: 182 days of the 2024 period have no data.
    expect(screen.getByText(/Montant partiel : 182 jours/)).toBeDefined();
  });

  it('should say a period has not started and offer no navigation', () => {
    render(<Harness at="2023-01-15" />);

    expect(
      screen.getByText('La première période de facturation commence le 3 mars 2023.'),
    ).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Période précédente' })).toBeNull();
  });

  it('should explain when the history is too short to estimate', () => {
    render(<Harness days={range('2026-06-01', '2026-06-10')} />);

    expect(
      screen.getByText("Pas assez d'historique pour estimer la fin de la période."),
    ).toBeDefined();
    expect(screen.getByText('Acquis à ce jour')).toBeDefined();
  });
});
