import { render, screen } from '@testing-library/react';

import { Footer } from './Footer';

describe('Footer', () => {
  it('should render the current year', () => {
    render(<Footer />);

    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeDefined();
  });

  it('should render the copyright text', () => {
    render(<Footer />);

    expect(screen.getByText(/Tous droits réservés/)).toBeDefined();
  });
});
