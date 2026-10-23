import { format, parseISO } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Flame, ShieldCheck, SolarPanel, Sun, Trophy } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { formatEnergy, formatPercent } from '../../shared/format/index.js';
import type { Records, Streak } from '../../shared/metrics/index.js';

type RecordsCardProps = {
  records: Records;
  /** Opens the dashboard on a range of days, bounds included, as `yyyy-MM-dd`. */
  onSelectRange: (from: string, to: string) => void;
  /** Opens the dashboard on a month, as `yyyy-MM`. */
  onSelectMonth: (month: string) => void;
  /** Opens the dashboard on the whole history. */
  onSelectAll: () => void;
};

type Fact = {
  key: string;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  onSelect: () => void;
};

export const RecordsCard: FunctionComponent<RecordsCardProps> = ({
  records,
  onSelectRange,
  onSelectMonth,
  onSelectAll,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? enUS : fr;

  const formatDay = (date: string) => format(parseISO(date), 'd MMM yyyy', { locale });
  const formatMonth = (month: string) => format(parseISO(`${month}-01`), 'MMMM yyyy', { locale });
  const streakFact = (key: string, label: string, streak: Streak): Fact => ({
    key,
    label,
    value: t('home.records.days', { count: streak.days }),
    detail:
      streak.from === streak.to
        ? formatDay(streak.from)
        : t('home.records.range', { from: formatDay(streak.from), to: formatDay(streak.to) }),
    icon: Flame,
    onSelect: () => onSelectRange(streak.from, streak.to),
  });

  const { bestDay, bestMonth, longestStreak, currentStreak, mostAutonomousMonth } = records;
  const facts: Fact[] = [
    {
      key: 'bestDay',
      label: t('home.records.bestDay'),
      value: formatEnergy(bestDay.value, i18n.language),
      detail: formatDay(bestDay.date),
      icon: Sun,
      onSelect: () => onSelectRange(bestDay.date, bestDay.date),
    },
    {
      key: 'bestMonth',
      label: t('home.records.bestMonth'),
      value: formatEnergy(bestMonth.value, i18n.language),
      detail: formatMonth(bestMonth.month),
      icon: CalendarDays,
      onSelect: () => onSelectMonth(bestMonth.month),
    },
    ...(longestStreak
      ? [streakFact('longestStreak', t('home.records.longestStreak'), longestStreak)]
      : []),
    ...(currentStreak
      ? [streakFact('currentStreak', t('home.records.currentStreak'), currentStreak)]
      : []),
    ...(mostAutonomousMonth
      ? [
          {
            key: 'mostAutonomousMonth',
            label: t('home.records.mostAutonomousMonth'),
            value: formatPercent(mostAutonomousMonth.value, i18n.language),
            detail: formatMonth(mostAutonomousMonth.month),
            icon: ShieldCheck,
            onSelect: () => onSelectMonth(mostAutonomousMonth.month),
          },
        ]
      : []),
    {
      key: 'totalProduction',
      label: t('home.records.totalProduction'),
      value: formatEnergy(records.totalProduction.value, i18n.language),
      detail: t('home.records.since', { date: formatDay(records.totalProduction.since) }),
      icon: SolarPanel,
      onSelect: onSelectAll,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6"
      aria-labelledby="records-title"
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-primary-text" aria-hidden="true" />
        <h3 id="records-title" className="text-sm font-semibold text-foreground">
          {t('home.records.title')}
        </h3>
        <span className="text-xs text-muted-foreground">{t('home.records.description')}</span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {facts.map(({ key, label, value, detail, icon: Icon, onSelect }) => (
          <li key={key}>
            <button
              type="button"
              onClick={onSelect}
              className="w-full h-full text-left rounded-lg bg-muted/50 hover:bg-muted p-4 flex gap-3 transition-smooth"
            >
              <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="flex flex-col gap-1 min-w-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-lg font-semibold text-foreground data-text">{value}</span>
                <span className="text-xs text-muted-foreground">{detail}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </motion.section>
  );
};
