import { fireEvent, render, screen } from '@testing-library/react';

import { MobileHeader } from './mobile-header.js';

const changeLanguage = vi.fn();
const toggleTheme = vi.fn();
const signoutRedirect = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage },
  }),
}));

vi.mock('../hooks/use-theme.hook.js', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme }),
}));

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({ signoutRedirect }),
}));

describe('MobileHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should switch to the other language', () => {
    render(<MobileHeader />);

    fireEvent.click(screen.getByRole('button', { name: 'language.en' }));

    expect(changeLanguage).toHaveBeenCalledWith('en');
  });

  it('should offer the light theme while dark', () => {
    render(<MobileHeader />);

    fireEvent.click(screen.getByRole('button', { name: 'theme.light' }));

    expect(toggleTheme).toHaveBeenCalled();
  });

  it('should sign out', () => {
    render(<MobileHeader />);

    fireEvent.click(screen.getByRole('button', { name: 'sidebar.nav.logout' }));

    expect(signoutRedirect).toHaveBeenCalled();
  });
});
