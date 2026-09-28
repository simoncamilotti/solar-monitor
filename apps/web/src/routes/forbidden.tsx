import { createFileRoute } from '@tanstack/react-router';

import { ForbiddenPage } from '../modules/auth/forbidden-page.js';

// Outside `_authenticated`: its sign-in redirect would bounce a visitor the API rejects straight
// back into a login loop instead of letting them see why they landed here.
export const Route = createFileRoute('/forbidden')({
  component: ForbiddenPage,
});
