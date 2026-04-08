vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import type { SyncStatusDto } from '@/shared-models';

import { SyncSystemItem } from './SyncSystemItem';

const defaultProps = {
  onSync: vi.fn(),
  isSyncing: false,
  onBackfill: vi.fn(),
  isBackfilling: false,
};

const systemWithRecords: SyncStatusDto = {
  systemId: 42,
  lastSyncDate: '2026-04-01T12:00:00Z',
  totalRecords: 180,
};

const systemWithoutRecords: SyncStatusDto = {
  systemId: 99,
  lastSyncDate: null,
  totalRecords: 0,
};

describe('SyncSystemItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render system info', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithRecords} />);

    expect(screen.getByText(/#42/)).toBeDefined();
    expect(screen.getByText(/180/)).toBeDefined();
  });

  it('should call onSync when sync button is clicked', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithRecords} />);

    fireEvent.click(screen.getByText('sync.trigger'));

    expect(defaultProps.onSync).toHaveBeenCalledWith(42);
  });

  it('should not show chevron when totalRecords > 0', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithRecords} />);

    expect(screen.queryByLabelText('More sync options')).toBeNull();
  });

  it('should show chevron when totalRecords === 0', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithoutRecords} />);

    expect(screen.getByLabelText('More sync options')).toBeDefined();
  });

  it('should show dropdown with backfill option when chevron is clicked', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithoutRecords} />);

    fireEvent.click(screen.getByLabelText('More sync options'));

    expect(screen.getByText('sync.backfill')).toBeDefined();
  });

  it('should call onBackfill when backfill option is clicked', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithoutRecords} />);

    fireEvent.click(screen.getByLabelText('More sync options'));
    fireEvent.click(screen.getByText('sync.backfill'));

    expect(defaultProps.onBackfill).toHaveBeenCalledWith(99);
  });

  it('should close dropdown after clicking backfill', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithoutRecords} />);

    fireEvent.click(screen.getByLabelText('More sync options'));
    fireEvent.click(screen.getByText('sync.backfill'));

    expect(screen.queryByText('sync.backfill')).toBeNull();
  });

  it('should close dropdown when clicking outside', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithoutRecords} />);

    fireEvent.click(screen.getByLabelText('More sync options'));
    expect(screen.getByText('sync.backfill')).toBeDefined();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('sync.backfill')).toBeNull();
  });

  it('should disable buttons when isSyncing', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithoutRecords} isSyncing />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect((btn as HTMLButtonElement).disabled).toBe(true));
  });

  it('should disable buttons when isBackfilling', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithoutRecords} isBackfilling />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect((btn as HTMLButtonElement).disabled).toBe(true));
  });

  it('should display never when lastSyncDate is null', () => {
    render(<SyncSystemItem {...defaultProps} system={systemWithoutRecords} />);

    expect(screen.getByText(/sync.never/)).toBeDefined();
  });
});
