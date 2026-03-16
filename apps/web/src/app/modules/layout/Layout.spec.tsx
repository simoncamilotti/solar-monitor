import { render, screen } from '@testing-library/react';

import { Layout } from './Layout';

vi.mock('react-router', () => ({
  Outlet: () => <div data-testid="outlet" />,
}));

vi.mock('./Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock('../ui/Sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe('Layout', () => {
  it('should render the Navbar', () => {
    render(<Layout navBar={<nav data-testid="navbar" />} />);

    expect(screen.getByTestId('navbar')).toBeDefined();
  });

  it('should render the Outlet', () => {
    render(<Layout navBar={<nav data-testid="navbar" />} />);

    expect(screen.getByTestId('outlet')).toBeDefined();
  });

  it('should render the Footer', () => {
    render(<Layout navBar={<nav data-testid="navbar" />} />);

    expect(screen.getByTestId('footer')).toBeDefined();
  });
});
