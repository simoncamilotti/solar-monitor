const mockChangeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: mockChangeLanguage },
  }),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import { SidebarLanguageSwitcher } from './SidebarLanguageSwitcher';

describe('SidebarLanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the language toggle button', () => {
    render(<SidebarLanguageSwitcher />);

    expect(screen.getByRole('button')).toBeDefined();
  });

  it('should show language.en text when current language is fr', () => {
    render(<SidebarLanguageSwitcher />);

    expect(screen.getByText('language.en')).toBeDefined();
  });

  it('should call changeLanguage with en when current language is fr', () => {
    render(<SidebarLanguageSwitcher />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });
});
