vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../modules/history/hooks/use-history-data.hook', () => ({
  useHistoryData: () => ({ data: undefined, isPending: true, isError: false }),
}));

import { render, screen } from '@testing-library/react';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render homepage title', () => {
    render(<HomePage />);

    expect(screen.getByText('home.title')).toBeDefined();
  });
});
