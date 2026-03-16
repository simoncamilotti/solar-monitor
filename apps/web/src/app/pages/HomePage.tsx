import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import type { BreadcrumbItemsProps } from '../modules/layout/PageBreadcrumb';
import { PageBreadcrumb } from '../modules/layout/PageBreadcrumb';
import { RouteNames } from '../routes/paths.const';

export const HomePage: FunctionComponent = () => {
  const { t } = useTranslation('web');

  const breadcrumbItems: BreadcrumbItemsProps = [
    {
      title: t(RouteNames.HOME),
    },
  ];

  return (
    <>
      <PageBreadcrumb breadcrumbItems={breadcrumbItems} />
      <div className="pt-20 pb-24 relative overflow-hidden">Homepage</div>
    </>
  );
};
