import { Flag } from 'lucide-react';
import type { FunctionComponent } from 'react';

import type { FeatureFlagDto } from '@/shared-models';

type FeatureFlagItemProps = {
  flag: FeatureFlagDto;
  handleToggle: (flag: FeatureFlagDto) => void;
};

export const FeatureFlagItem: FunctionComponent<FeatureFlagItemProps> = ({ flag, handleToggle }) => {
  return (
    <div
      key={flag.key}
      className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-surface-hover transition-colors"
    >
      <div className="flex items-center gap-3">
        <Flag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{flag.key}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={flag.enabled}
        onClick={() => handleToggle(flag)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          flag.enabled ? 'bg-primary' : 'bg-input'
        }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            flag.enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
