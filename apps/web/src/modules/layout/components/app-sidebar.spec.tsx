import { render, screen } from '@testing-library/react';

import { AppSidebar } from './app-sidebar.js';

vi.mock('./sidebar-logo.js', () => ({
  SidebarLogo: () => <div data-testid="sidebar-logo" />,
}));

vi.mock('./sidebar-nav.js', () => ({
  SidebarNav: () => <div data-testid="sidebar-nav" />,
}));

vi.mock('./sidebar-language-switcher.js', () => ({
  SidebarLanguageSwitcher: () => <div data-testid="sidebar-language-switcher" />,
}));

vi.mock('./sidebar-theme-toggle.js', () => ({
  SidebarThemeToggle: () => <div data-testid="sidebar-theme-toggle" />,
}));

vi.mock('./sidebar-footer.js', () => ({
  SidebarFooter: () => <div data-testid="sidebar-footer" />,
}));

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the sidebar logo', () => {
    render(<AppSidebar />);

    expect(screen.getByTestId('sidebar-logo')).toBeDefined();
  });

  it('should render the sidebar nav', () => {
    render(<AppSidebar />);

    expect(screen.getByTestId('sidebar-nav')).toBeDefined();
  });

  it('should render the sidebar language switcher', () => {
    render(<AppSidebar />);

    expect(screen.getByTestId('sidebar-language-switcher')).toBeDefined();
  });

  it('should render the sidebar theme toggle', () => {
    render(<AppSidebar />);

    expect(screen.getByTestId('sidebar-theme-toggle')).toBeDefined();
  });

  it('should render the sidebar footer', () => {
    render(<AppSidebar />);

    expect(screen.getByTestId('sidebar-footer')).toBeDefined();
  });
});
