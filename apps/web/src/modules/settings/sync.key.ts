const syncRootKey = 'sync';

export const syncKey = {
  status: [syncRootKey, 'status'] as const,
  schedule: [syncRootKey, 'schedule'] as const,
};
