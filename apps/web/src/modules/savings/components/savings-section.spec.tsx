import {
  getPricingFindTariffsMockHandler,
  getPricingGetInstallationMockHandler,
} from '@repo/api-client/mocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { LifetimeDay, Tariff } from '@repo/contracts';

import { server } from '../../../test/setup.js';
import type { DashboardFilterState } from '../../home/dashboard.type.js';
import { SavingsSection } from './savings-section.js';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: { children: ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const day = (date: string): LifetimeDay => ({
  date,
  kwhProduced: 10,
  kwhConsumed: 8,
  kwhImported: 2,
  kwhExported: 4,
  gridDependency: 25,
});

const data = [day('2024-06-01'), day('2025-06-01')];

const tariff = (kind: Tariff['kind'], pricePerKwh: number, effectiveFrom: string): Tariff => ({
  id: crypto.randomUUID(),
  kind,
  pricePerKwh,
  effectiveFrom,
});

const yearly2025: DashboardFilterState = {
  viewMode: 'yearly',
  selectedYear: 2025,
  selectedMonth: 0,
  selectedMetric: 'kwhProduced',
  customStartDate: null,
  customEndDate: null,
};

const renderSection = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SavingsSection data={data} filters={yearly2025} />
    </QueryClientProvider>,
  );
};

describe('SavingsSection', () => {
  it('should invite to enter tariffs when there is none', async () => {
    server.use(getPricingFindTariffsMockHandler([]));

    renderSection();

    expect(await screen.findByText(/Renseignez vos tarifs/)).toBeDefined();
    expect(screen.getByRole('link', { name: 'Renseigner les tarifs' }).getAttribute('href')).toBe(
      '/settings',
    );
  });

  it('should value the period at the tariffs in force, against the previous period', async () => {
    server.use(
      getPricingFindTariffsMockHandler([
        tariff('purchase', 0.2, '2024-01-01'),
        tariff('purchase', 0.25, '2025-01-01'),
        tariff('feedIn', 0.1, '2024-01-01'),
      ]),
      getPricingGetInstallationMockHandler({ cost: null }),
    );

    renderSection();

    // 6 kWh used on site at 0.25 €, 4 kWh sold at 0.10 €.
    expect(await screen.findByText(/^1,50\s€$/)).toBeDefined();
    expect(screen.getByText(/^0,40\s€$/)).toBeDefined();
    expect(screen.getByText(/^1,90\s€$/)).toBeDefined();
    // Savings grew from 1.20 € to 1.50 €.
    expect(screen.getByText('25.0%')).toBeDefined();
    expect(screen.queryByText('Retour sur investissement')).toBeNull();
  });

  it('should say how many days have no tariff in force', async () => {
    server.use(
      getPricingFindTariffsMockHandler([tariff('purchase', 0.2, '2024-01-01')]),
      getPricingGetInstallationMockHandler({ cost: null }),
    );

    renderSection();

    expect(await screen.findByText(/1 jour de la période n'a pas de tarif/)).toBeDefined();
  });

  it('should show the return on investment once the cost is known', async () => {
    server.use(
      getPricingFindTariffsMockHandler([
        tariff('purchase', 0.2, '2024-01-01'),
        tariff('feedIn', 0.1, '2024-01-01'),
      ]),
      getPricingGetInstallationMockHandler({ cost: 100 }),
    );

    renderSection();

    expect(await screen.findByText('Retour sur investissement')).toBeDefined();
    // 3.20 € gained out of 100 €.
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('3');
    expect(screen.getByText(/Rentabilité estimée en/)).toBeDefined();
  });
});
