import { fireEvent, render, screen } from '@testing-library/react';

const mockFlags = [
  { key: 'projects', enabled: true },
  { key: 'blog', enabled: false },
];

const mockMutate = vi.fn();
const mockUseQuery = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useQueryClient: () => ({
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../hooks/use-toggle-feature-flag-mutation.hook', () => ({
  useToggleFeatureFlagMutation: () => ({
    toggleFeatureFlagMutation: {
      mutate: mockMutate,
      isPending: false,
    },
  }),
}));

vi.mock('./FeatureFlagForm', () => ({
  FeatureFlagForm: () => <div data-testid="feature-flag-form" />,
}));

vi.mock('./FeatureFlagListSkeleton', () => ({
  FeatureFlagListSkeleton: () => <div data-testid="feature-flag-skeleton" />,
}));

import { FeatureFlagList } from './FeatureFlagList';

describe('FeatureFlagList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: mockFlags, isPending: false });
  });

  it('should render the list of feature flags', () => {
    render(<FeatureFlagList />);

    expect(screen.getByText('projects')).toBeDefined();
    expect(screen.getByText('blog')).toBeDefined();
  });

  it('should render toggle switches with correct state', () => {
    render(<FeatureFlagList />);

    const switches = screen.getAllByRole('switch');
    expect(switches[0].getAttribute('aria-checked')).toBe('true');
    expect(switches[1].getAttribute('aria-checked')).toBe('false');
  });

  it('should call mutation when toggling a flag', () => {
    render(<FeatureFlagList />);

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);

    expect(mockMutate).toHaveBeenCalledWith(
      { key: 'projects', enabled: false },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('should render the add form', () => {
    render(<FeatureFlagList />);

    expect(screen.getByTestId('feature-flag-form')).toBeDefined();
  });

  it('should show empty state when no flags exist', () => {
    mockUseQuery.mockReturnValue({ data: [], isPending: false });

    render(<FeatureFlagList />);

    expect(screen.getByText('featureFlags.empty')).toBeDefined();
  });

  it('should show loading skeleton while fetching', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isPending: true });

    render(<FeatureFlagList />);

    expect(screen.getByTestId('feature-flag-skeleton')).toBeDefined();
    expect(screen.queryByText('projects')).toBeNull();
  });
});
