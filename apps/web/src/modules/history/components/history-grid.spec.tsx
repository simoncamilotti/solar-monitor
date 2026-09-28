import { render, screen } from '@testing-library/react';

import type { LifetimeDataResponseDto } from '@repo/contracts';

import { HistoryGrid } from './history-grid.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
}));

vi.mock('../../layout/hooks/use-theme.hook.js', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('ag-grid-react', () => ({
  AgGridReact: (props: Record<string, unknown>) => (
    <div data-testid="ag-grid" data-row-count={(props.rowData as unknown[])?.length} />
  ),
}));

vi.mock('../hooks/use-history-grid.hook.js', () => ({
  useHistoryGrid: () => ({
    columnDefs: [],
    gridOptions: {},
    onGridReady: vi.fn(),
  }),
}));

vi.mock('../../ui/constants/ag-grid-theme.js', () => ({
  agThemeDark: 'dark-theme',
  agThemeLight: 'light-theme',
}));

const mockData: LifetimeDataResponseDto = [
  {
    date: '2024-01-01',
    kwhProduced: 10,
    kwhConsumed: 8,
    kwhImported: 2,
    kwhExported: 4,
    gridDependency: 20,
  },
];

describe('HistoryGrid', () => {
  it('should render ag-grid component', () => {
    render(<HistoryGrid data={mockData} />);

    expect(screen.getByTestId('ag-grid')).toBeDefined();
  });

  it('should pass data to ag-grid', () => {
    render(<HistoryGrid data={mockData} />);

    expect(screen.getByTestId('ag-grid').getAttribute('data-row-count')).toBe('1');
  });
});
