import {
  getPricingCreateTariffMockHandler,
  getPricingFindTariffsMockHandler,
} from '@repo/api-client/mocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import type { Tariff, TariffCreate } from '@repo/contracts';

import { server } from '../../../test/setup.js';
import { TariffsCard } from './tariffs-card.js';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

const older: Tariff = {
  id: '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11',
  kind: 'purchase',
  pricePerKwh: 0.2,
  effectiveFrom: '2024-01-01',
};
const newer: Tariff = {
  id: '1c6d9d4f-6e3b-4b6a-8b6a-4a2a6d2f3b22',
  kind: 'purchase',
  pricePerKwh: 0.2516,
  effectiveFrom: '2025-02-01',
};
// As the API sends them: from the oldest to the newest.
const tariffs = [older, newer];

const renderCard = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TariffsCard />
    </QueryClientProvider>,
  );
};

const fillForm = (price: string, date: string) => {
  fireEvent.change(screen.getByLabelText('Prix (€/kWh)'), { target: { value: price } });
  fireEvent.change(screen.getByLabelText("Date d'effet"), { target: { value: date } });
};

describe('TariffsCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should list the tariffs of each kind, the newest first', async () => {
    server.use(getPricingFindTariffsMockHandler(tariffs));

    renderCard();

    const prices = await screen.findAllByText(/\/kWh$/);
    expect(prices.map((node) => node.textContent?.replace(/\s/g, ' '))).toEqual([
      '0,2516 €/kWh',
      '0,20 €/kWh',
    ]);
    // No feed-in tariff yet.
    expect(screen.getByText('Aucun tarif.')).toBeDefined();
  });

  it('should send the tariff typed with a decimal comma', async () => {
    server.use(getPricingFindTariffsMockHandler([]));
    let sent: TariffCreate | undefined;
    server.use(
      getPricingCreateTariffMockHandler(async ({ request }) => {
        sent = (await request.json()) as TariffCreate;
        return { ...older, ...sent };
      }),
    );

    renderCard();
    await screen.findByText('Ajouter');
    fireEvent.click(screen.getByRole('button', { name: 'Rachat' }));
    fillForm('0,04', '2025-03-01');
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Tarif ajouté'));
    expect(sent).toEqual({ kind: 'feedIn', pricePerKwh: 0.04, effectiveFrom: '2025-03-01' });
  });

  it('should keep the add button disabled until the tariff is valid', async () => {
    server.use(getPricingFindTariffsMockHandler([]));

    renderCard();
    await screen.findByText('Ajouter');
    const add = screen.getByRole('button', { name: 'Ajouter' }) as HTMLButtonElement;

    expect(add.disabled).toBe(true);
    fillForm('-1', '2025-03-01');
    expect(add.disabled).toBe(true);
    fillForm('0,2', '2025-03-01');
    expect(add.disabled).toBe(false);
  });

  it('should explain a tariff that already starts that day', async () => {
    server.use(
      getPricingFindTariffsMockHandler(tariffs),
      http.post('*/api/pricing/tariffs', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Conflict', status: 409 },
          { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    );

    renderCard();
    await screen.findByText('Ajouter');
    fillForm('0,3', '2025-02-01');
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Un tarif de ce type commence déjà à cette date.'),
    );
  });

  it('should delete a tariff', async () => {
    server.use(getPricingFindTariffsMockHandler(tariffs));
    const deleted = vi.fn();
    server.use(
      http.delete('*/api/pricing/tariffs/:id', ({ params }) => {
        deleted(params['id']);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderCard();
    // The newest tariff is listed first.
    const [first] = await screen.findAllByRole('button', { name: 'Supprimer le tarif' });
    if (first) fireEvent.click(first);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Tarif supprimé'));
    expect(deleted).toHaveBeenCalledWith(newer.id);
  });
});
