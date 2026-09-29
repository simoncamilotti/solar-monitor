import { createFileRoute } from '@tanstack/react-router';

import type { SigninState } from '../auth/user-manager.js';
import { Layout } from '../modules/layout/components/layout.js';

/** Layout of the pages that require a signed-in user: redirects to the identity provider. */
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      const state: SigninState = { returnTo: location.href };
      await context.auth.signinRedirect({ state });
    }
  },
  component: Layout,
});
