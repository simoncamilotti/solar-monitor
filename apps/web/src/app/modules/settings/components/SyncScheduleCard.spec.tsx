vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockUseSyncSchedule = vi.fn();
vi.mock('../hooks/use-sync-schedule.hook', () => ({
  useSyncSchedule: () => mockUseSyncSchedule(),
}));

const mockMutate = vi.fn();
vi.mock('../hooks/use-update-sync-schedule-mutation.hook', () => ({
  useUpdateSyncScheduleMutation: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import { SyncScheduleCard } from './SyncScheduleCard';

describe('SyncScheduleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skeleton when loading', () => {
    mockUseSyncSchedule.mockReturnValue({ data: undefined, isPending: true, isError: false });
    const { container } = render(<SyncScheduleCard />);

    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });

  it('should render error message on error', () => {
    mockUseSyncSchedule.mockReturnValue({ data: undefined, isPending: false, isError: true });
    render(<SyncScheduleCard />);

    expect(screen.getByText('syncSchedule.loadError')).toBeDefined();
  });

  it('should render title and description', () => {
    mockUseSyncSchedule.mockReturnValue({ data: { syncTime: '02:00' }, isPending: false, isError: false });
    render(<SyncScheduleCard />);

    expect(screen.getByText('syncSchedule.title')).toBeDefined();
    expect(screen.getByText('syncSchedule.description')).toBeDefined();
  });

  it('should render time input with current value', () => {
    mockUseSyncSchedule.mockReturnValue({ data: { syncTime: '03:30' }, isPending: false, isError: false });
    render(<SyncScheduleCard />);

    const input = screen.getByLabelText('syncSchedule.time') as HTMLInputElement;
    expect(input.value).toBe('03:30');
  });

  it('should disable save button when value unchanged', () => {
    mockUseSyncSchedule.mockReturnValue({ data: { syncTime: '02:00' }, isPending: false, isError: false });
    render(<SyncScheduleCard />);

    const saveButton = screen.getByText('syncSchedule.save').closest('button')!;
    expect(saveButton.disabled).toBe(true);
  });

  it('should call mutate when save is clicked after change', () => {
    mockUseSyncSchedule.mockReturnValue({ data: { syncTime: '02:00' }, isPending: false, isError: false });
    render(<SyncScheduleCard />);

    const input = screen.getByLabelText('syncSchedule.time');
    fireEvent.change(input, { target: { value: '05:00' } });

    const saveButton = screen.getByText('syncSchedule.save').closest('button')!;
    fireEvent.click(saveButton);

    expect(mockMutate).toHaveBeenCalledWith('05:00', expect.objectContaining({ onSuccess: expect.any(Function) }));
  });
});
