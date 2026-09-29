import { createFileRoute } from '@tanstack/react-router';

import { SettingsPage } from '../../modules/settings/settings-page.js';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
});
