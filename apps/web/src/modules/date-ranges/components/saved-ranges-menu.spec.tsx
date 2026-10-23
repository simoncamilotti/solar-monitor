import {
  getDateRangesCreateMockHandler,
  getDateRangesDeleteMockHandler,
  getDateRangesFindAllMockHandler,
  getDateRangesUpdateMockHandler,
} from '@repo/api-client/mocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import type { DateRange, DateRangeCreate, DateRangeUpdate } from '@repo/contracts';

import { server } from '../../../test/setup.js';
import { SavedRangesMenu } from './saved-ranges-menu.js';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

const summer: DateRange = {
  id: '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11',
  name: 'Été 2024',
  startDate: '2024-06-21',
  endDate: '2024-09-22',
};

const renderMenu = (props: Partial<Parameters<typeof SavedRangesMenu>[0]> = {}) => {
  const onApply = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <SavedRangesMenu onApply={onApply} {...props} />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Plages enregistrées' }));
  return { onApply };
};

describe('SavedRangesMenu', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should apply a saved range in a click', async () => {
    server.use(getDateRangesFindAllMockHandler([summer]));

    const { onApply } = renderMenu();
    const item = await screen.findByText('Été 2024');
    expect(screen.getByText('21 juin 2024 — 22 sept. 2024')).toBeDefined();
    fireEvent.click(item);

    expect(onApply).toHaveBeenCalledWith(summer);
  });

  it('should say when no range is saved yet', async () => {
    server.use(getDateRangesFindAllMockHandler([]));

    renderMenu();

    expect(await screen.findByText('Aucune plage enregistrée pour le moment.')).toBeDefined();
  });

  it('should save the current range under a name', async () => {
    let sent: DateRangeCreate | undefined;
    server.use(
      getDateRangesFindAllMockHandler([]),
      getDateRangesCreateMockHandler(async ({ request }) => {
        sent = (await request.json()) as DateRangeCreate;
        return { ...summer, ...sent };
      }),
    );

    renderMenu({ current: { startDate: '2024-06-21', endDate: '2024-09-22' } });
    const save = await screen.findByRole('button', { name: 'Enregistrer' });
    expect((save as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Nom de la plage'), { target: { value: ' Été 2024 ' } });
    fireEvent.click(save);

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Plage « Été 2024 » enregistrée'),
    );
    expect(sent).toEqual({ name: 'Été 2024', startDate: '2024-06-21', endDate: '2024-09-22' });
  });

  it('should not offer to save an incomplete range', async () => {
    server.use(getDateRangesFindAllMockHandler([]));

    renderMenu({ current: { startDate: '2024-06-21', endDate: null } });
    await screen.findByText('Aucune plage enregistrée pour le moment.');

    expect(screen.queryByLabelText('Nom de la plage')).toBeNull();
  });

  it('should tell when the name is already taken', async () => {
    server.use(
      getDateRangesFindAllMockHandler([summer]),
      http.post('*/api/date-ranges', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Conflict', status: 409 },
          { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    );

    renderMenu({ current: { startDate: '2024-06-21', endDate: '2024-09-22' } });
    fireEvent.change(await screen.findByLabelText('Nom de la plage'), {
      target: { value: 'Été 2024' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Une plage porte déjà ce nom'));
  });

  it('should rename a saved range', async () => {
    let sent: DateRangeUpdate | undefined;
    server.use(
      getDateRangesFindAllMockHandler([summer]),
      getDateRangesUpdateMockHandler(async ({ request }) => {
        sent = (await request.json()) as DateRangeUpdate;
        return { ...summer, ...sent };
      }),
    );

    renderMenu();
    fireEvent.click(await screen.findByRole('button', { name: 'Renommer « Été 2024 »' }));
    fireEvent.change(screen.getByLabelText('Nom de la plage'), {
      target: { value: 'Vacances' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Valider le nom' }));

    await waitFor(() => expect(sent).toEqual({ name: 'Vacances' }));
  });

  it('should delete a saved range', async () => {
    const deleted = vi.fn();
    server.use(
      getDateRangesFindAllMockHandler([summer]),
      getDateRangesDeleteMockHandler(({ params }) => {
        deleted(params['id']);
      }),
    );

    renderMenu();
    fireEvent.click(await screen.findByRole('button', { name: 'Supprimer « Été 2024 »' }));

    await waitFor(() => expect(deleted).toHaveBeenCalledWith(summer.id));
  });
});
