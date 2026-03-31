import type { FunctionComponent } from 'react';

import type { CompareRange, ViewMode } from '../home.type';

type CompareRangeSelectorProps = {
  viewMode: ViewMode;
  compareRange: CompareRange;
  onCompareRangeChange: (range: CompareRange) => void;
};

export const CompareRangeSelector: FunctionComponent<CompareRangeSelectorProps> = ({
  viewMode,
  compareRange,
  onCompareRangeChange,
}) => (
  <div>
    <label className="text-xs text-muted-foreground mb-2 block">
      Comparer avec {viewMode === 'monthly' ? 'les mois' : 'les années'} précédent(e)s
    </label>
    <div className="flex gap-2">
      {([1, 2, 3] as CompareRange[]).map(range => (
        <button
          key={range}
          onClick={() => onCompareRangeChange(range)}
          className={`flex-1 text-xs py-2 rounded-lg border transition-smooth font-medium ${
            compareRange === range
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
          }`}
        >
          {range} {viewMode === 'monthly' ? 'mois' : range > 1 ? 'ans' : 'an'}
        </button>
      ))}
    </div>
  </div>
);
