import { render, screen } from '@testing-library/react';

import { RequireAuth } from './require-auth.js';

const mockAuth = {
  isAuthenticated: false,
  activeNavigator: undefined as string | undefined,
  signinRedirect: vi.fn().mockResolvedValue(undefined),
};

vi.mock('react-oidc-context', () => ({
  useAuth: () => mockAuth,
}));

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.isAuthenticated = false;
    mockAuth.activeNavigator = undefined;
  });

  it('renders its children for a signed-in user', () => {
    mockAuth.isAuthenticated = true;
    render(<RequireAuth>content</RequireAuth>);

    expect(screen.getByText('content')).toBeDefined();
    expect(mockAuth.signinRedirect).not.toHaveBeenCalled();
  });

  it('sends anyone else to the identity provider, back to the requested page', () => {
    render(<RequireAuth>content</RequireAuth>);

    expect(screen.queryByText('content')).toBeNull();
    expect(mockAuth.signinRedirect).toHaveBeenCalledWith({
      state: { returnTo: window.location.href },
    });
  });

  it('waits while a sign-in is already on its way', () => {
    mockAuth.activeNavigator = 'signinRedirect';
    render(<RequireAuth>content</RequireAuth>);

    expect(mockAuth.signinRedirect).not.toHaveBeenCalled();
  });
});
