vi.mock('./SidebarLogo', () => ({
  SidebarLogo: () => <div data-testid="sidebar-logo" />,
}));

vi.mock('./SidebarNav', () => ({
  SidebarNav: () => <div data-testid="sidebar-nav" />,
}));

vi.mock('./SidebarLanguageSwitcher', () => ({
  SidebarLanguageSwitcher: () => <div data-testid="sidebar-language-switcher" />,
}));

vi.mock('./SidebarThemeToggle', () => ({
  SidebarThemeToggle: () => <div data-testid="sidebar-theme-toggle" />,
}));

vi.mock('./SidebarFooter', () => ({
  SidebarFooter: () => <div data-testid="sidebar-footer" />,
}));

import { render, screen } from '@testing-library/react';

import { AppSidebar } from './AppSidebar';

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
