import { AgGridReact } from 'ag-grid-react';
import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';

import type { LifetimeDataResponseDto } from '@/shared-models';

import { useTheme } from '../../layout/hooks/use-theme.hook';
import { agThemeDark, agThemeLight } from '../../ui/constants/ag-grid-theme';
import { useHistoryGrid } from '../hooks/use-history-grid.hook';

type HistoryGridProps = {
  data: LifetimeDataResponseDto;
};

export const HistoryGrid: FunctionComponent<HistoryGridProps> = ({ data }) => {
  const { theme } = useTheme();
  const { columnDefs, gridOptions, onGridReady } = useHistoryGrid();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated overflow-hidden"
      style={{ height: 'calc(100vh - 140px)' }}
    >
      <div className="w-full h-full">
        <AgGridReact
          gridOptions={gridOptions}
          theme={theme === 'dark' ? agThemeDark : agThemeLight}
          columnDefs={columnDefs}
          rowData={data}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100, 500]}
          onGridReady={onGridReady}
          getRowId={params => String(params.data.date)}
        />
      </div>
    </motion.div>
  );
};
