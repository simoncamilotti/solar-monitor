vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../modules/settings/components/FeatureFlagList', () => ({
  FeatureFlagList: () => <div data-testid="feature-flag-list" />,
}));

vi.mock('../modules/settings/components/SyncStatusCard', () => ({
  SyncStatusCard: () => <div data-testid="sync-status-card" />,
}));

import { render, screen } from '@testing-library/react';

import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page header with title', () => {
    render(<SettingsPage />);

    expect(screen.getByText('settings.title')).toBeDefined();
    expect(screen.getByText('settings.description')).toBeDefined();
  });

  it('should render the sync status card', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('sync-status-card')).toBeDefined();
  });

  it('should render the feature flag list', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('feature-flag-list')).toBeDefined();
  });
});
