import type { FunctionComponent } from 'react';

export const FeatureFlagListSkeleton: FunctionComponent = () => (
  <div className="space-y-3">
    {[1, 2].map(i => (
      <div key={i} className="h-14 rounded-xl border border-border/50 bg-card animate-pulse" />
    ))}
  </div>
);
