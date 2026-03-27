vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.count !== undefined) return `${key} (${opts.count})`;
      return key;
    },
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../hooks/use-export.hook', () => ({
  useExport: () => ({
    exportData: mockExportData,
    getFilteredData: mockGetFilteredData,
    getAvailableYears: () => ['2023', '2024'],
  }),
}));

const mockExportData = vi.fn();
const mockGetFilteredData = vi.fn().mockReturnValue([{ date: '2024-01-01' }, { date: '2024-01-02' }]);

import { fireEvent, render, screen } from '@testing-library/react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { ExportModal } from './ExportModal';

const mockData: LifetimeDataResponseDto = [
  { date: new Date('2024-01-01'), kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4, gridDependency: 20 },
  {
    date: new Date('2024-06-15'),
    kwhProduced: 15,
    kwhConsumed: 12,
    kwhImported: 3,
    kwhExported: 6,
    gridDependency: 25,
  },
];

describe('ExportModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    data: mockData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFilteredData.mockReturnValue([{ date: '2024-01-01' }, { date: '2024-01-02' }]);
  });

  it('should not render when closed', () => {
    render(<ExportModal {...defaultProps} open={false} />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should render dialog when open', () => {
    render(<ExportModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('export.title')).toBeDefined();
  });

  it('should render format selection buttons', () => {
    render(<ExportModal {...defaultProps} />);

    expect(screen.getByText('CSV')).toBeDefined();
    expect(screen.getByText('Excel')).toBeDefined();
  });

  it('should render year and month selects', () => {
    render(<ExportModal {...defaultProps} />);

    expect(screen.getByText('export.allYears')).toBeDefined();
    expect(screen.getByText('export.allMonths')).toBeDefined();
  });

  it('should render metric checkboxes', () => {
    render(<ExportModal {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(5);
  });

  it('should toggle metric on click', () => {
    render(<ExportModal {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];

    expect(firstCheckbox.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(firstCheckbox);

    expect(firstCheckbox.getAttribute('aria-checked')).toBe('false');
  });

  it('should call onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<ExportModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('export.cancel'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call exportData and onClose when export button is clicked', () => {
    const onClose = vi.fn();
    render(<ExportModal {...defaultProps} onClose={onClose} />);

    const exportButtons = screen.getAllByText('export.export');
    const footerExportButton = exportButtons[exportButtons.length - 1];
    fireEvent.click(footerExportButton);

    expect(mockExportData).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<ExportModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<ExportModal {...defaultProps} onClose={onClose} />);

    const backdrop = document.querySelector('.bg-black\\/60');
    if (backdrop) fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onClose when close X button is clicked', () => {
    const onClose = vi.fn();
    render(<ExportModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should disable export when no metrics selected', () => {
    render(<ExportModal {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(cb => {
      if (cb.getAttribute('aria-checked') === 'true') {
        fireEvent.click(cb);
      }
    });

    const exportButtons = screen.getAllByText('export.export');
    const footerExportButton = exportButtons[exportButtons.length - 1];
    expect((footerExportButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('should display available years in dropdown', () => {
    render(<ExportModal {...defaultProps} />);

    expect(screen.getByText('2023')).toBeDefined();
    expect(screen.getByText('2024')).toBeDefined();
  });
});
