import { createFileRoute } from '@tanstack/react-router';

import { ComparePage } from '../../modules/comparison/compare-page.js';

export const Route = createFileRoute('/_authenticated/compare')({
  component: ComparePage,
});
