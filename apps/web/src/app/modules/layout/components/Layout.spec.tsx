vi.mock('react-router', () => ({
  Outlet: () => <div data-testid="outlet" />,
}));

vi.mock('./AppSidebar', () => ({
  AppSidebar: () => <aside data-testid="app-sidebar" />,
}));

import { render, screen } from '@testing-library/react';

import { Layout } from './Layout';

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the sidebar', () => {
    render(<Layout />);

    expect(screen.getByTestId('app-sidebar')).toBeDefined();
  });

  it('should render the outlet', () => {
    render(<Layout />);

    expect(screen.getByTestId('outlet')).toBeDefined();
  });

  it('should render a main element', () => {
    render(<Layout />);

    expect(screen.getByRole('main')).toBeDefined();
  });
});
