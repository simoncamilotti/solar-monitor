vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockUseSyncStatus = vi.fn();
vi.mock('../hooks/use-sync-status.hook', () => ({
  useSyncStatus: () => mockUseSyncStatus(),
}));

const mockMutate = vi.fn();
vi.mock('../hooks/use-trigger-sync-mutation.hook', () => ({
  useTriggerSyncMutation: () => ({
    mutate: mockMutate,
    isPending: false,
    variables: undefined,
  }),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import { SyncStatusCard } from './SyncStatusCard';

describe('SyncStatusCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skeleton when loading', () => {
    mockUseSyncStatus.mockReturnValue({ data: undefined, isPending: true, isError: false });
    const { container } = render(<SyncStatusCard />);

    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });

  it('should render error message on error', () => {
    mockUseSyncStatus.mockReturnValue({ data: undefined, isPending: false, isError: true });
    render(<SyncStatusCard />);

    expect(screen.getByText('sync.loadError')).toBeDefined();
  });

  it('should render no systems message when empty', () => {
    mockUseSyncStatus.mockReturnValue({ data: [], isPending: false, isError: false });
    render(<SyncStatusCard />);

    expect(screen.getByText('sync.noSystems')).toBeDefined();
  });

  it('should render system info when data loaded', () => {
    mockUseSyncStatus.mockReturnValue({
      data: [{ systemId: 123, lastSyncDate: '2026-04-02', totalRecords: 42 }],
      isPending: false,
      isError: false,
    });
    render(<SyncStatusCard />);

    expect(screen.getByText(/sync.system/)).toBeDefined();
    expect(screen.getByText(/#123/)).toBeDefined();
    expect(screen.getByText(/42/)).toBeDefined();
  });

  it('should render title and description', () => {
    mockUseSyncStatus.mockReturnValue({ data: [], isPending: false, isError: false });
    render(<SyncStatusCard />);

    expect(screen.getByText('sync.title')).toBeDefined();
    expect(screen.getByText('sync.description')).toBeDefined();
  });

  it('should call mutate when sync button is clicked', () => {
    mockUseSyncStatus.mockReturnValue({
      data: [{ systemId: 123, lastSyncDate: '2026-04-02', totalRecords: 42 }],
      isPending: false,
      isError: false,
    });
    render(<SyncStatusCard />);

    fireEvent.click(screen.getByText('sync.trigger'));

    expect(mockMutate).toHaveBeenCalledWith(123, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('should display never when lastSyncDate is null', () => {
    mockUseSyncStatus.mockReturnValue({
      data: [{ systemId: 789, lastSyncDate: null, totalRecords: 0 }],
      isPending: false,
      isError: false,
    });
    render(<SyncStatusCard />);

    expect(screen.getByText(/sync.never/)).toBeDefined();
  });
});
