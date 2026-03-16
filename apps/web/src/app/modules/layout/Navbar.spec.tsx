import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

vi.mock('../auth/auth', () => ({
  logout: vi.fn(),
}));

import { Navbar } from './Navbar';

describe('Navbar', () => {
  const renderNavbar = () =>
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

  it('should render a link to dashboard', () => {
    renderNavbar();

    const links = screen.getAllByRole('link');
    const homeLink = links.find(link => link.getAttribute('href') === '/');
    expect(homeLink).toBeDefined();
  });

  it('should render the logout button', () => {
    renderNavbar();

    expect(screen.getByRole('button', { name: 'Déconnexion' })).toBeDefined();
  });

  it('should not render navigation anchors', () => {
    renderNavbar();

    expect(screen.queryByText('CV')).toBeNull();
  });
});
