import type { FunctionComponent } from 'react';

import { FeatureFlagList } from '../modules/settings/components/FeatureFlagList';

export const SettingsPage: FunctionComponent = () => {
  return (
    <>
      <div className="py-12 relative overflow-hidden">
        <div className="mx-auto">
          <FeatureFlagList />
        </div>
      </div>
    </>
  );
};
