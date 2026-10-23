import type { FunctionComponent } from 'react';

import { PickerGrid } from './picker-grid.js';

type YearGridProps = {
  years: number[];
  selected?: number;
  onSelect: (year: number) => void;
};

/** The years of the history. */
export const YearGrid: FunctionComponent<YearGridProps> = ({ years, selected, onSelect }) => (
  <PickerGrid
    items={years.map((year) => ({
      key: year,
      label: String(year),
      selected: year === selected,
      disabled: false,
      onSelect: () => onSelect(year),
    }))}
  />
);
