import type { FunctionComponent } from 'react';

import type { Metric } from '../home.type';

type CompareIndicatorSelectorProps = {
  selectedIndicators: Metric[];
  onIndicatorChange: (indicators: Metric[]) => void;
};

export const CompareIndicatorSelector: FunctionComponent<CompareIndicatorSelectorProps> = ({
  selectedIndicators,
  onIndicatorChange,
}) => {
  const handleChange = (indicator: Metric) => {
    onIndicatorChange(selectedIndicators.map(si => (si.key === indicator.key ? { ...si, enabled: !si.enabled } : si)));
  };

  return (
    <div className="mb-4">
      <label className="text-xs text-muted-foreground mb-2 block">Indicateurs</label>
      {selectedIndicators.map(indicator => (
        <div key={indicator.key}>
          <label className="text-xs text-muted-foreground mb-2 block">{indicator.key}</label>
          <button
            type="button"
            role="switch"
            aria-checked={indicator.enabled}
            onClick={() => handleChange(indicator)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              indicator.enabled ? 'bg-primary' : 'bg-input'
            }`}
          >
            <span
              className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                indicator.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
};
