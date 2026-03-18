vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: vi.fn() },
  }),
}));

vi.mock('react-router', () => ({
  NavLink: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('../../auth/auth', () => ({
  logout: vi.fn(),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import { logout } from '../../auth/auth';
import { SidebarFooter } from './SidebarFooter';

describe('SidebarFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the settings link pointing to /settings', () => {
    render(<SidebarFooter />);

    const link = screen.getByRole('link', { name: /sidebar\.nav\.settings/ });
    expect(link.getAttribute('href')).toBe('/settings');
  });

  it('should render the logout button', () => {
    render(<SidebarFooter />);

    expect(screen.getByText('sidebar.nav.logout')).toBeDefined();
  });

  it('should call logout when clicking the logout button', () => {
    render(<SidebarFooter />);

    const logoutButton = screen.getByText('sidebar.nav.logout');
    fireEvent.click(logoutButton);

    expect(logout).toHaveBeenCalled();
  });
});
