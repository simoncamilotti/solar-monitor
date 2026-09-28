import { render, screen } from '@testing-library/react';

import { SidebarLogo } from './sidebar-logo.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: vi.fn() },
  }),
}));

vi.mock('../../auth/auth.js', () => ({
  getAuthenticatedUsername: vi.fn().mockReturnValue('John Doe'),
}));

vi.mock('../../ui/braces.js', () => ({
  Braces: () => <svg data-testid="braces-icon" />,
}));

describe('SidebarLogo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the username', () => {
    render(<SidebarLogo />);

    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('should render the sidebar title translation key', () => {
    render(<SidebarLogo />);

    expect(screen.getByText('sidebar.title')).toBeDefined();
  });
});
