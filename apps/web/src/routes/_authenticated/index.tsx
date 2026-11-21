import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '../../modules/home/home-page.js';

export const Route = createFileRoute('/_authenticated/')({
  // The billing period of the resale card lives in the URL: `/?facturation=2025` opens the
  // period that started in 2025. Anything else means the current period.
  validateSearch: (search: Record<string, unknown>): { facturation?: number } => {
    const year = Number(search['facturation']);
    return Number.isInteger(year) && year >= 1900 && year <= 2999 ? { facturation: year } : {};
  },
  component: HomeRoute,
});

function HomeRoute() {
  const { facturation } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <HomePage
      billingYear={facturation}
      onBillingYearChange={(year) =>
        void navigate({ search: year === undefined ? {} : { facturation: year } })
      }
    />
  );
}
