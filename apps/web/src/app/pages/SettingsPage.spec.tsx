vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../modules/settings/components/FeatureFlagList', () => ({
  FeatureFlagList: () => <div data-testid="feature-flag-list" />,
}));

import { render, screen } from '@testing-library/react';

import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the feature flag list component', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('feature-flag-list')).toBeDefined();
  });
});
