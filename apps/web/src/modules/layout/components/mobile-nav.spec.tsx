import { render, screen } from '@testing-library/react';

import { MobileNav } from './mobile-nav.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('MobileNav', () => {
  it('should be a labelled navigation hidden from 768 px up', () => {
    render(<MobileNav />);

    const nav = screen.getByRole('navigation', { name: 'sidebar.nav.label' });
    expect(nav.className).toContain('md:hidden');
  });

  it('should link the four pages, settings included', () => {
    render(<MobileNav />);

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/compare', '/history', '/settings']);
  });
});
