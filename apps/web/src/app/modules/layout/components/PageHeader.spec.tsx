import { fireEvent, render, screen } from '@testing-library/react';

import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('should render title and description', () => {
    render(<PageHeader title="My Title" description="My description" />);

    expect(screen.getByText('My Title')).toBeDefined();
    expect(screen.getByText('My description')).toBeDefined();
  });

  it('should render icon when provided', () => {
    render(<PageHeader title="Title" description="Desc" icon={<span data-testid="icon">icon</span>} />);

    expect(screen.getByTestId('icon')).toBeDefined();
  });

  it('should render action button when action is provided', () => {
    const onClick = vi.fn();
    render(<PageHeader title="Title" description="Desc" action={{ label: 'Export', onClick }} />);

    const button = screen.getByRole('button', { name: /Export/ });
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should disable action button when disabled is true', () => {
    render(
      <PageHeader title="Title" description="Desc" action={{ label: 'Export', onClick: vi.fn(), disabled: true }} />,
    );

    const button = screen.getByRole('button', { name: /Export/ });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('should render action icon when provided', () => {
    render(
      <PageHeader
        title="Title"
        description="Desc"
        action={{ label: 'Export', onClick: vi.fn(), icon: <span data-testid="action-icon" /> }}
      />,
    );

    expect(screen.getByTestId('action-icon')).toBeDefined();
  });

  it('should render trailing content', () => {
    render(<PageHeader title="Title" description="Desc" trailing={<span data-testid="trailing">trailing</span>} />);

    expect(screen.getByTestId('trailing')).toBeDefined();
  });

  it('should render both action and trailing together', () => {
    render(
      <PageHeader
        title="Title"
        description="Desc"
        action={{ label: 'Click me', onClick: vi.fn() }}
        trailing={<span data-testid="trailing">info</span>}
      />,
    );

    expect(screen.getByRole('button', { name: /Click me/ })).toBeDefined();
    expect(screen.getByTestId('trailing')).toBeDefined();
  });

  it('should not render button when no action is provided', () => {
    render(<PageHeader title="Title" description="Desc" />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
