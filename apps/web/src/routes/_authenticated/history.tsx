import { createFileRoute } from '@tanstack/react-router';

import { HistoryPage } from '../../modules/history/history-page.js';
import { type HistoryView, HISTORY_VIEWS } from '../../modules/history/history-view.type.js';

export const Route = createFileRoute('/_authenticated/history')({
  // The view lives in the URL: `/history?view=calendar` opens the calendar directly.
  validateSearch: (search: Record<string, unknown>): { view?: HistoryView } =>
    HISTORY_VIEWS.includes(search['view'] as HistoryView)
      ? { view: search['view'] as HistoryView }
      : {},
  component: HistoryRoute,
});

function HistoryRoute() {
  const { view = 'table' } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <HistoryPage
      view={view}
      onViewChange={(next) => void navigate({ search: next === 'table' ? {} : { view: next } })}
    />
  );
}
