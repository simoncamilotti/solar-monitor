export const HISTORY_VIEWS = ['table', 'calendar'] as const;

export type HistoryView = (typeof HISTORY_VIEWS)[number];
