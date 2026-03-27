import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import { type FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LifetimeDataResponseDto } from '@/shared-models';

import type { ExportConfig, ExportFormat, ExportMetric } from '../hooks/use-export.hook';
import { useExport } from '../hooks/use-export.hook';

type ExportModalProps = {
  open: boolean;
  onClose: () => void;
  data: LifetimeDataResponseDto;
};

const ALL_METRICS: ExportMetric[] = ['kwhProduced', 'kwhConsumed', 'kwhImported', 'kwhExported', 'gridDependency'];

export const ExportModal: FunctionComponent<ExportModalProps> = ({ open, onClose, data }) => {
  const { t } = useTranslation('web');
  const { exportData, getFilteredData, getAvailableYears } = useExport(data);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [format, setFormat] = useState<ExportFormat>('csv');
  const [year, setYear] = useState('all');
  const [month, setMonth] = useState('all');
  const [metrics, setMetrics] = useState<ExportMetric[]>([...ALL_METRICS]);

  const years = useMemo(() => getAvailableYears(), [getAvailableYears]);

  const filteredCount = useMemo(() => {
    const config: ExportConfig = { format, year, month, metrics };
    return getFilteredData(config).length;
  }, [format, year, month, metrics, getFilteredData]);

  const toggleMetric = (metric: ExportMetric) => {
    setMetrics(prev => (prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]));
  };

  const handleExport = () => {
    exportData({ format, year, month, metrics });
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const metricLabels: Record<ExportMetric, string> = {
    kwhProduced: t('export.metrics.produced'),
    kwhConsumed: t('export.metrics.consumed'),
    kwhImported: t('export.metrics.imported'),
    kwhExported: t('export.metrics.exported'),
    gridDependency: t('export.metrics.gridDependency'),
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: t(`months.${i}`),
  }));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-labelledby="export-dialog-title"
            className="relative z-10 w-full max-w-lg rounded-xl bg-card border border-border shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 pb-2">
              <h2 id="export-dialog-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                {t('export.title')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t('export.description')}</p>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-5">
              {/* Format */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('export.format')}
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormat('csv')}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      format === 'csv'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => setFormat('excel')}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      format === 'excel'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </button>
                </div>
              </div>

              {/* Scope */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('export.scope')}
                </span>
                <div>
                  <span className="text-sm text-muted-foreground mt-1">
                    {t('export.scopeAll', { count: filteredCount })}
                  </span>
                </div>
              </div>

              {/* Year / Month filters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('export.year')}
                  </span>
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="all">{t('export.allYears')}</option>
                    {years.map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('export.month')}
                  </span>
                  <select
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="all">{t('export.allMonths')}</option>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('export.metricsLabel')}
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ALL_METRICS.map(metric => {
                    const checked = metrics.includes(metric);
                    return (
                      <label key={metric} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          onClick={() => toggleMetric(metric)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                            checked ? 'bg-primary' : 'border-2 border-border bg-transparent'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                        </button>
                        {metricLabels[metric]}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 pt-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {t('export.cancel')}
              </button>
              <button
                onClick={handleExport}
                disabled={metrics.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {t('export.export')}
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
