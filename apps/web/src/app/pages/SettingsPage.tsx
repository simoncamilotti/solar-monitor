import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router';

import type { BreadcrumbItemsProps } from '../modules/layout/PageBreadcrumb';
import { PageBreadcrumb } from '../modules/layout/PageBreadcrumb';
import { FeatureFlagList } from '../modules/settings/components/FeatureFlagList';
import { RouteNames, RoutePaths } from '../routes/paths.const';

export const SettingsPage: FunctionComponent = () => {
  const { t } = useTranslation('web');

  const breadcrumbItems: BreadcrumbItemsProps = [
    {
      title: t(RouteNames.HOME),
      to: generatePath(RoutePaths.HOME),
    },
    {
      title: t(RouteNames.SETTINGS),
    },
  ];

  return (
    <>
      <PageBreadcrumb breadcrumbItems={breadcrumbItems} />
      <div className="py-12 relative overflow-hidden">
        <div className="mx-auto">
          <FeatureFlagList />
        </div>
      </div>
    </>
  );
};
