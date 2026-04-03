vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockHistoryData = vi.fn();
vi.mock('../modules/history/hooks/use-history-data.hook', () => ({
  useHistoryData: () => mockHistoryData(),
}));

vi.mock('../modules/comparison/components/ComparisonContent', () => ({
  ComparisonContent: ({ data }: { data: unknown[] }) => (
    <div data-testid="comparison-content">{data.length} entries</div>
  ),
}));

vi.mock('../modules/comparison/components/ComparisonPageSkeleton', () => ({
  ComparisonPageSkeleton: () => <div data-testid="comparison-skeleton" />,
}));

import { render, screen } from '@testing-library/react';

import { ComparePage } from './ComparePage';

const mockData = [
  { date: '2024-01-01', kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4, gridDependency: 20 },
  { date: '2024-01-02', kwhProduced: 12, kwhConsumed: 9, kwhImported: 1, kwhExported: 5, gridDependency: 15 },
];

describe('ComparePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page header with title and description', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: true, isError: false });
    render(<ComparePage />);

    expect(screen.getByText('compare.title')).toBeDefined();
    expect(screen.getByText('compare.description')).toBeDefined();
  });

  it('should render skeleton when loading', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: true, isError: false });
    render(<ComparePage />);

    expect(screen.getByTestId('comparison-skeleton')).toBeDefined();
    expect(screen.queryByTestId('comparison-content')).toBeNull();
  });

  it('should render error message on error', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: false, isError: true });
    render(<ComparePage />);

    expect(screen.getByText('compare.error')).toBeDefined();
    expect(screen.queryByTestId('comparison-content')).toBeNull();
  });

  it('should render comparison content when data is loaded', () => {
    mockHistoryData.mockReturnValue({ data: mockData, isPending: false, isError: false });
    render(<ComparePage />);

    expect(screen.getByTestId('comparison-content')).toBeDefined();
    expect(screen.queryByTestId('comparison-skeleton')).toBeNull();
  });

  it('should not render error when loading', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: true, isError: false });
    render(<ComparePage />);

    expect(screen.queryByText('compare.error')).toBeNull();
  });

  it('should not render skeleton or content on error', () => {
    mockHistoryData.mockReturnValue({ data: undefined, isPending: false, isError: true });
    render(<ComparePage />);

    expect(screen.queryByTestId('comparison-skeleton')).toBeNull();
    expect(screen.queryByTestId('comparison-content')).toBeNull();
  });
});
