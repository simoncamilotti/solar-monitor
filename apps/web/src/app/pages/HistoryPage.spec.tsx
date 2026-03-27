vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockHistoryData = vi.fn();
vi.mock('../modules/history/hooks/use-history-data.hook', () => ({
  useHistoryData: () => mockHistoryData(),
}));

vi.mock('../modules/history/components/HistoryGrid', () => ({
  HistoryGrid: ({ data }: { data: unknown[] }) => <div data-testid="history-grid">{data.length} rows</div>,
}));

vi.mock('../modules/history/components/ExportModal', () => ({
  ExportModal: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="export-modal">
        <button onClick={onClose}>close</button>
      </div>
    ) : null,
}));

vi.mock('../modules/history/components/GridSkeleton', () => ({
  GridSkeleton: () => <div data-testid="grid-skeleton" />,
}));

import { fireEvent, render, screen } from '@testing-library/react';

import { HistoryPage } from './HistoryPage';

const mockData = [
  { date: '2024-01-01', kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4, gridDependency: 20 },
  { date: '2024-01-02', kwhProduced: 12, kwhConsumed: 9, kwhImported: 1, kwhExported: 5, gridDependency: 15 },
];

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skeleton when loading', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: true, isError: false });
    render(<HistoryPage />);

    expect(screen.getByTestId('grid-skeleton')).toBeDefined();
    expect(screen.queryByTestId('history-grid')).toBeNull();
  });

  it('should render error message on error', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: false, isError: true });
    render(<HistoryPage />);

    expect(screen.getByText('history.error')).toBeDefined();
    expect(screen.queryByTestId('history-grid')).toBeNull();
  });

  it('should render history grid when data is loaded', () => {
    mockHistoryData.mockReturnValue({ data: mockData, isPending: false, isError: false });
    render(<HistoryPage />);

    expect(screen.getByTestId('history-grid')).toBeDefined();
    expect(screen.queryByTestId('grid-skeleton')).toBeNull();
  });

  it('should render page header with title and description', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: true, isError: false });
    render(<HistoryPage />);

    expect(screen.getByText('history.title')).toBeDefined();
    expect(screen.getByText('history.description')).toBeDefined();
  });

  it('should render export button', () => {
    mockHistoryData.mockReturnValue({ data: mockData, isPending: false, isError: false });
    render(<HistoryPage />);

    expect(screen.getByRole('button', { name: /export.export/ })).toBeDefined();
  });

  it('should disable export button when no data', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: true, isError: false });
    render(<HistoryPage />);

    expect((screen.getByRole('button', { name: /export.export/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('should display record count when data is loaded', () => {
    mockHistoryData.mockReturnValue({ data: mockData, isPending: false, isError: false });
    render(<HistoryPage />);

    expect(screen.getByText(/2.*export.records/)).toBeDefined();
  });

  it('should open export modal on button click', () => {
    mockHistoryData.mockReturnValue({ data: mockData, isPending: false, isError: false });
    render(<HistoryPage />);

    expect(screen.queryByTestId('export-modal')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /export.export/ }));

    expect(screen.getByTestId('export-modal')).toBeDefined();
  });

  it('should close export modal', () => {
    mockHistoryData.mockReturnValue({ data: mockData, isPending: false, isError: false });
    render(<HistoryPage />);

    fireEvent.click(screen.getByRole('button', { name: /export.export/ }));
    expect(screen.getByTestId('export-modal')).toBeDefined();

    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByTestId('export-modal')).toBeNull();
  });
});
