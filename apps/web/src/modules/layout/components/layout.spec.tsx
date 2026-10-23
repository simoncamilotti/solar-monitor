import { render, screen } from '@testing-library/react';

import { Layout } from './layout.js';

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="outlet" />,
}));

vi.mock('./app-sidebar.js', () => ({
  AppSidebar: () => <aside data-testid="app-sidebar" />,
}));

vi.mock('./mobile-header.js', () => ({
  MobileHeader: () => <header data-testid="mobile-header" />,
}));

vi.mock('./mobile-nav.js', () => ({
  MobileNav: () => <nav data-testid="mobile-nav" />,
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the sidebar', () => {
    render(<Layout />);

    expect(screen.getByTestId('app-sidebar')).toBeDefined();
  });

  it('should render the mobile header and bottom navigation', () => {
    render(<Layout />);

    expect(screen.getByTestId('mobile-header')).toBeDefined();
    expect(screen.getByTestId('mobile-nav')).toBeDefined();
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
