import { render, screen } from '@testing-library/react';

import { SettingsPage } from './settings-page.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./components/sync-status-card.js', () => ({
  SyncStatusCard: () => <div data-testid="sync-status-card" />,
}));

vi.mock('./components/sync-schedule-card.js', () => ({
  SyncScheduleCard: () => <div data-testid="sync-schedule-card" />,
}));

vi.mock('./components/tariffs-card.js', () => ({
  TariffsCard: () => <div data-testid="tariffs-card" />,
}));

vi.mock('./components/installation-card.js', () => ({
  InstallationCard: () => <div data-testid="installation-card" />,
}));

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

  it('should render the sync schedule card', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('sync-schedule-card')).toBeDefined();
  });

  it('should render the tariffs and installation cards', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('tariffs-card')).toBeDefined();
    expect(screen.getByTestId('installation-card')).toBeDefined();
  });
});
