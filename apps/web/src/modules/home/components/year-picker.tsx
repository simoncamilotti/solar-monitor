import type { FunctionComponent } from 'react';

import { PickerDropdown } from './picker-dropdown.js';
import { YearGrid } from './year-grid.js';

type YearPickerProps = {
  inputYear: number;
  availableYears?: number[];
  onChange: (year: number | null) => void;
};

export const YearPicker: FunctionComponent<YearPickerProps> = ({
  inputYear,
  availableYears,
  onChange,
}) => (
  <PickerDropdown label={String(inputYear)}>
    {({ close }) => (
      <YearGrid
        years={availableYears ?? [inputYear]}
        selected={inputYear}
        onSelect={(year) => {
          onChange(year);
          close();
        }}
      />
    )}
  </PickerDropdown>
);
