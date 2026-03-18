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

import { render, screen } from '@testing-library/react';

import { SidebarNav } from './SidebarNav';

describe('SidebarNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a nav element', () => {
    render(<SidebarNav />);

    expect(screen.getByRole('navigation')).toBeDefined();
  });

  it('should render the home link with correct text', () => {
    render(<SidebarNav />);

    expect(screen.getByText('sidebar.nav.home')).toBeDefined();
  });

  it('should have the home link pointing to /', () => {
    render(<SidebarNav />);

    const link = screen.getByRole('link', { name: /sidebar\.nav\.home/ });
    expect(link.getAttribute('href')).toBe('/');
  });
});
