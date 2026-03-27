import { render } from '@testing-library/react';

import { GridSkeleton } from './GridSkeleton';

describe('GridSkeleton', () => {
  it('should render skeleton rows', () => {
    const { container } = render(<GridSkeleton />);

    const rows = container.querySelectorAll('.grid.grid-cols-9');
    expect(rows).toHaveLength(9);
  });

  it('should render 9 cells per row', () => {
    const { container } = render(<GridSkeleton />);

    const firstRow = container.querySelector('.grid.grid-cols-9');
    const cells = firstRow?.children;
    expect(cells).toHaveLength(9);
  });

  it('should render header skeleton', () => {
    const { container } = render(<GridSkeleton />);

    const header = container.querySelector('.h-12.animate-pulse');
    expect(header).not.toBeNull();
  });
});
