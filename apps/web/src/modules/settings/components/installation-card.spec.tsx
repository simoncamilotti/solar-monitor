import {
  getPricingGetInstallationMockHandler,
  getPricingUpdateInstallationMockHandler,
} from '@repo/api-client/mocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { Installation } from '@repo/contracts';

import { server } from '../../../test/setup.js';
import { InstallationCard } from './installation-card.js';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

const renderCard = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <InstallationCard />
    </QueryClientProvider>,
  );
};

describe('InstallationCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should show the stored cost', async () => {
    server.use(getPricingGetInstallationMockHandler({ cost: 9500 }));

    renderCard();

    const input = (await screen.findByLabelText('Coût (€)')) as HTMLInputElement;
    expect(input.value).toBe('9500');
  });

  it('should save a cost typed with a decimal comma', async () => {
    let sent: Installation | undefined;
    server.use(
      getPricingGetInstallationMockHandler({ cost: null }),
      getPricingUpdateInstallationMockHandler(async ({ request }) => {
        sent = (await request.json()) as Installation;
        return sent;
      }),
    );

    renderCard();
    const input = await screen.findByLabelText('Coût (€)');
    const save = screen.getByRole('button', { name: 'Enregistrer' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);

    fireEvent.change(input, { target: { value: '9500,50' } });
    fireEvent.click(save);

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Coût de l'installation enregistré"),
    );
    expect(sent).toEqual({ cost: 9500.5 });
  });

  it('should clear the cost when the field is emptied', async () => {
    let sent: Installation | undefined;
    server.use(
      getPricingGetInstallationMockHandler({ cost: 9500 }),
      getPricingUpdateInstallationMockHandler(async ({ request }) => {
        sent = (await request.json()) as Installation;
        return sent;
      }),
    );

    renderCard();
    fireEvent.change(await screen.findByLabelText('Coût (€)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(sent).toEqual({ cost: null }));
  });
});
