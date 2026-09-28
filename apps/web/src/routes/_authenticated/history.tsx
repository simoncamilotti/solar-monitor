import { createFileRoute } from '@tanstack/react-router';

import { HistoryPage } from '../../modules/history/history-page.js';

export const Route = createFileRoute('/_authenticated/history')({
  component: HistoryPage,
});
