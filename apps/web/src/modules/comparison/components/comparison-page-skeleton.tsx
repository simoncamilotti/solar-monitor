import type { FunctionComponent } from 'react';

export const ComparisonPageSkeleton: FunctionComponent = () => (
  <div className="space-y-4">
    <div className="h-14 rounded-xl border border-border/50 bg-muted animate-pulse" />
    <div className="h-[450px] rounded-xl border border-border/50 bg-muted animate-pulse" />
  </div>
);
