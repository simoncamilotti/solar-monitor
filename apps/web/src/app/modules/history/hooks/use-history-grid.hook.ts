import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';
import { format, isAfter, parse } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_GRID_OPTIONS } from '../../ui/constants/ag-grid-default-options';

export const useHistoryGrid = () => {
  const { t, i18n } = useTranslation('web');

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'date',
        headerName: t('history.columns.date'),
        valueGetter: params => {
          return format(new Date(params.data.date), 'dd-MM-yyyy');
        },
        sortable: true,
        comparator: (valueA, valueB) => {
          if (valueA === valueB) {
            return 0;
          }

          return isAfter(parse(valueA, 'dd-MM-yyyy', new Date()), parse(valueB, 'dd-MM-yyyy', new Date())) ? 1 : -1;
        },
        flex: 1,
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: (filterDate: Date, cellValue: string) => {
            const cellDate = parse(cellValue, 'dd-MM-yyyy', new Date());
            if (cellDate < filterDate) {
              return -1;
            }
            if (cellDate > filterDate) {
              return 1;
            }
            return 0;
          },
        },
      },
      {
        headerName: t('history.columns.year'),
        valueGetter: params => {
          return Number(format(new Date(params.data.date), 'yyyy'));
        },
        type: 'solarNumericColumn',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
      },
      {
        headerName: t('history.columns.month'),
        valueGetter: params => {
          return Number(format(new Date(params.data.date), 'MM'));
        },
        type: 'solarNumericColumn',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
      },
      {
        headerName: t('history.columns.day'),
        valueGetter: params => {
          return Number(format(new Date(params.data.date), 'dd'));
        },
        type: 'solarNumericColumn',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
      },
      {
        field: 'kwhProduced',
        headerName: t('history.columns.produced'),
        type: 'solarNumericColumn',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
        cellStyle: { fontFamily: "'SF Mono', 'Fira Code', monospace" },
        valueFormatter: p => p.value?.toFixed(2),
      },
      {
        field: 'kwhConsumed',
        headerName: t('history.columns.consumed'),
        type: 'solarNumericColumn',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
        cellStyle: { fontFamily: "'SF Mono', 'Fira Code', monospace" },
        valueFormatter: p => p.value?.toFixed(2),
      },
      {
        field: 'kwhImported',
        headerName: t('history.columns.imported'),
        type: 'solarNumericColumn',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
        cellStyle: { fontFamily: "'SF Mono', 'Fira Code', monospace" },
        valueFormatter: p => p.value?.toFixed(2),
      },
      {
        field: 'kwhExported',
        headerName: t('history.columns.exported'),
        type: 'solarNumericColumn',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
        cellStyle: { fontFamily: "'SF Mono', 'Fira Code', monospace" },
        valueFormatter: p => p.value?.toFixed(2),
      },
      {
        field: 'gridDependency',
        headerName: t('history.columns.gridDependency'),
        type: 'solarNumericColumn',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
        cellStyle: { fontFamily: "'SF Mono', 'Fira Code', monospace" },
        valueFormatter: p => p.value?.toFixed(2) + ' %',
      },
    ],
    [i18n.language, t],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      floatingFilter: true,
      resizable: true,
      minWidth: 70,
    }),
    [],
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  const gridOptions: AgGridReactProps = {
    ...DEFAULT_GRID_OPTIONS,
    defaultColDef,
  };

  return {
    gridOptions,
    columnDefs,
    onGridReady,
  };
};
