import type { FunctionComponent } from 'react';

export const HomePageSkeleton: FunctionComponent = () => (
  <div className="space-y-4">
    {/* Filters skeleton */}
    <div className="h-14 rounded-xl border border-border/50 bg-muted animate-pulse" />

    {/* KPI grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 rounded-xl border border-border/50 bg-muted animate-pulse" />
      ))}
    </div>

    {/* Chart skeleton */}
    <div className="h-[400px] rounded-xl border border-border/50 bg-muted animate-pulse" />
  </div>
);
