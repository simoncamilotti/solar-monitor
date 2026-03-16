import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import type { BreadcrumbItemsProps } from './PageBreadcrumb';
import { PageBreadcrumb } from './PageBreadcrumb';

describe('PageBreadcrumb', () => {
  it('should render a single breadcrumb item as text', () => {
    const items: BreadcrumbItemsProps = [{ title: 'Accueil' }];

    render(<PageBreadcrumb breadcrumbItems={items} />);

    expect(screen.getByText('Accueil')).toBeDefined();
  });

  it('should render a breadcrumb item with a link', () => {
    const items: BreadcrumbItemsProps = [{ title: 'Accueil', to: '/' }, { title: 'Cv' }];

    render(
      <MemoryRouter>
        <PageBreadcrumb breadcrumbItems={items} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Accueil' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/');
  });

  it('should render the last item without a link', () => {
    const items: BreadcrumbItemsProps = [{ title: 'Accueil', to: '/' }, { title: 'Cv' }];

    render(
      <MemoryRouter>
        <PageBreadcrumb breadcrumbItems={items} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Cv')).toBeDefined();
    expect(screen.queryByRole('link', { name: 'Cv' })).toBeNull();
  });

  it('should render multiple breadcrumb items', () => {
    const items: BreadcrumbItemsProps = [
      { title: 'Accueil', to: '/' },
      { title: 'Section', to: '/section' },
      { title: 'Page' },
    ];

    render(
      <MemoryRouter>
        <PageBreadcrumb breadcrumbItems={items} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByText('Page')).toBeDefined();
  });
});
