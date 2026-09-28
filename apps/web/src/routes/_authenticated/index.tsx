import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '../../modules/home/home-page.js';

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
});
