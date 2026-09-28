import { fireEvent, render, screen } from '@testing-library/react';

import { SidebarThemeToggle } from './sidebar-theme-toggle.js';

const mockToggleTheme = vi.fn();
let mockTheme = 'dark';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: vi.fn() },
  }),
}));

vi.mock('../hooks/use-theme.hook.js', () => ({
  useTheme: () => ({ theme: mockTheme, toggleTheme: mockToggleTheme }),
}));

describe('SidebarThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'dark';
  });

  it('should render light mode text when theme is dark', () => {
    render(<SidebarThemeToggle />);

    expect(screen.getByText('theme.light')).toBeDefined();
  });

  it('should render dark mode text when theme is light', () => {
    mockTheme = 'light';

    render(<SidebarThemeToggle />);

    expect(screen.getByText('theme.dark')).toBeDefined();
  });

  it('should call toggleTheme when clicking the button', () => {
    render(<SidebarThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalled();
  });
});
