import type { FunctionComponent, PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

import type { SigninState } from './user-manager.js';

/** Renders its children for a signed-in user, sends anyone else to the identity provider. */
export const RequireAuth: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const auth = useAuth();
  const mustSignIn = !auth.isAuthenticated && !auth.activeNavigator;

  useEffect(() => {
    if (mustSignIn) {
      const state: SigninState = { returnTo: window.location.href };
      void auth.signinRedirect({ state });
    }
  }, [auth, mustSignIn]);

  return auth.isAuthenticated ? children : null;
};
