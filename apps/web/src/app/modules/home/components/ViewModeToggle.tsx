import type { FunctionComponent } from 'react';

import type { ViewMode } from '../home.type';

type ViewModeToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export const ViewModeToggle: FunctionComponent<ViewModeToggleProps> = ({ viewMode, onViewModeChange }) => (
  <div className="mb-4">
    <label className="text-xs text-muted-foreground mb-2 block">Mode de vue</label>
    <div className="flex rounded-lg bg-muted p-1">
      {(['monthly', 'yearly'] as ViewMode[]).map(mode => (
        <button
          key={mode}
          onClick={() => onViewModeChange(mode)}
          className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-smooth font-medium ${
            viewMode === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {mode === 'monthly' ? 'Mensuel' : 'Annuel'}
        </button>
      ))}
    </div>
  </div>
);
