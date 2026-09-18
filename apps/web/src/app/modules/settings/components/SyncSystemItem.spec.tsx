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
  expectedRecords: 180,
  gaps: [],
};

const systemWithoutRecords: SyncStatusDto = {
  systemId: 99,
  lastSyncDate: null,
  totalRecords: 0,
  expectedRecords: 0,
  gaps: [],
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

  describe("couverture de l'historique", () => {
    const systemWithGaps: SyncStatusDto = {
      systemId: 7,
      lastSyncDate: '2026-04-02T00:00:00Z',
      totalRecords: 106,
      expectedRecords: 123,
      gaps: [
        { from: '2026-03-16', to: '2026-04-01', days: 17 },
        { from: '2026-01-05', to: '2026-01-05', days: 1 },
      ],
    };

    it('should show the stored/expected ratio when the history is incomplete', () => {
      render(<SyncSystemItem {...defaultProps} system={systemWithGaps} />);

      expect(screen.getByText(/106 \/ 123/)).toBeDefined();
    });

    it('should not show a ratio when the history is complete', () => {
      render(<SyncSystemItem {...defaultProps} system={systemWithRecords} />);

      expect(screen.queryByText(/180 \/ 180/)).toBeNull();
    });

    it('should list every gap with its bounds', () => {
      render(<SyncSystemItem {...defaultProps} system={systemWithGaps} />);

      expect(screen.getAllByText('sync.fillGap')).toHaveLength(2);
      expect(screen.getByText(/2026-03-16 → 2026-04-01/)).toBeDefined();
      expect(screen.getByText(/2026-01-05 → 2026-01-05/)).toBeDefined();
    });

    it('should render no gap section when the history is contiguous', () => {
      render(<SyncSystemItem {...defaultProps} system={systemWithRecords} />);

      expect(screen.queryByText('sync.fillGap')).toBeNull();
    });

    // The button must fill THE gap, not re-import the whole history.
    it('should backfill only the clicked gap range', () => {
      render(<SyncSystemItem {...defaultProps} system={systemWithGaps} />);

      fireEvent.click(screen.getAllByText('sync.fillGap')[0]);

      expect(defaultProps.onBackfill).toHaveBeenCalledWith(7, { startDate: '2026-03-16', endDate: '2026-04-01' });
    });

    it('should disable the fill buttons while a sync is running', () => {
      render(<SyncSystemItem {...defaultProps} system={systemWithGaps} isSyncing={true} />);

      for (const button of screen.getAllByText('sync.fillGap')) {
        expect((button.closest('button') as HTMLButtonElement).disabled).toBe(true);
      }
    });
  });
});
