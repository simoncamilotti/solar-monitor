import type { AgGridReactProps } from 'ag-grid-react';

export const DEFAULT_GRID_OPTIONS: AgGridReactProps = {
  headerHeight: 48,
  rowHeight: 44,
  suppressCellFocus: true,
  animateRows: true,
  columnTypes: {
    solarNumericColumn: {
      headerClass: ['solar-numeric-header'],
      cellClass: ['solar-numeric-cell'],
    },
  },
};
