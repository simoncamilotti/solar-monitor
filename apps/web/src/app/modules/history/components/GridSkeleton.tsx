import type { FunctionComponent } from 'react';

export const GridSkeleton: FunctionComponent = () => (
  <div className="space-y-3">
    <div className="h-12 rounded-xl border border-border/50 bg-muted animate-pulse" />
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
      <div key={i} className="grid grid-cols-9 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(j => (
          <div key={`${i}-${j}`} className="h-8 rounded-xl border border-border/50 bg-muted animate-pulse" />
        ))}
      </div>
    ))}
  </div>
);
