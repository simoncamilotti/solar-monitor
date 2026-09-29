import { fireEvent, render, screen } from '@testing-library/react';

import { SidebarFooter } from './sidebar-footer.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const mockAuth = { signoutRedirect: vi.fn() };
vi.mock('react-oidc-context', () => ({
  useAuth: () => mockAuth,
}));

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

    expect(mockAuth.signoutRedirect).toHaveBeenCalled();
  });
});
