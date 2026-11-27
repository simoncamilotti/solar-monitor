import {
  getPricingGetBillingMockHandler,
  getPricingUpdateBillingMockHandler,
} from '@repo/api-client/mocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { Billing } from '@repo/contracts';

import { server } from '../../../test/setup.js';
import { BillingCard } from './billing-card.js';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

const renderCard = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <BillingCard />
    </QueryClientProvider>,
  );
};

describe('BillingCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should show the stored start and the period it opens', async () => {
    server.use(getPricingGetBillingMockHandler({ startDate: '2023-03-03' }));

    renderCard();

    const input = (await screen.findByLabelText('Début de la facturation')) as HTMLInputElement;
    expect(input.value).toBe('2023-03-03');
    expect(screen.getByText(/Période en cours : du 3 mars \d{4} au 2 mars \d{4}/)).toBeDefined();
  });

  it('should save a start', async () => {
    let sent: Billing | undefined;
    server.use(
      getPricingGetBillingMockHandler({ startDate: null }),
      getPricingUpdateBillingMockHandler(async ({ request }) => {
        sent = (await request.json()) as Billing;
        return sent;
      }),
    );

    renderCard();
    fireEvent.change(await screen.findByLabelText('Début de la facturation'), {
      target: { value: '2023-03-03' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(sent).toEqual({ startDate: '2023-03-03' }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Début de la facturation enregistré'),
    );
  });

  it('should not offer to save before anything changes', async () => {
    server.use(getPricingGetBillingMockHandler({ startDate: '2023-03-03' }));

    renderCard();
    await screen.findByLabelText('Début de la facturation');

    expect(
      (screen.getByRole('button', { name: 'Enregistrer' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('should clear the start', async () => {
    let sent: Billing | undefined;
    server.use(
      getPricingGetBillingMockHandler({ startDate: '2023-03-03' }),
      getPricingUpdateBillingMockHandler(async ({ request }) => {
        sent = (await request.json()) as Billing;
        return sent;
      }),
    );

    renderCard();
    fireEvent.click(await screen.findByRole('button', { name: 'Effacer' }));

    await waitFor(() => expect(sent).toEqual({ startDate: null }));
  });

  it('should not offer to clear an unknown start', async () => {
    server.use(getPricingGetBillingMockHandler({ startDate: null }));

    renderCard();
    await screen.findByLabelText('Début de la facturation');

    expect(screen.queryByRole('button', { name: 'Effacer' })).toBeNull();
  });
});
