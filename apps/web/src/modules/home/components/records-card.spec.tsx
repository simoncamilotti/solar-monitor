import { fireEvent, render, screen } from '@testing-library/react';

import type { Records } from '../../shared/metrics/index.js';
import { RecordsCard } from './records-card.js';

const records: Records = {
  bestDay: { date: '2024-06-21', value: 21.4 },
  bestMonth: { month: '2024-07', value: 480 },
  longestStreak: { from: '2024-07-01', to: '2024-07-03', days: 3 },
  currentStreak: { from: '2024-08-10', to: '2024-08-10', days: 1 },
  mostAutonomousMonth: { month: '2024-06', value: 92.5 },
  totalProduction: { since: '2024-01-01', value: 3490 },
};

const renderCard = (overrides: Partial<Records> = {}) => {
  const handlers = { onSelectRange: vi.fn(), onSelectMonth: vi.fn(), onSelectAll: vi.fn() };
  render(<RecordsCard records={{ ...records, ...overrides }} {...handlers} />);
  return handlers;
};

describe('RecordsCard', () => {
  it('should show every fact with its value and date', () => {
    renderCard();

    expect(screen.getByText('Meilleur jour')).toBeDefined();
    expect(screen.getByText('21.4 kWh')).toBeDefined();
    expect(screen.getByText('21 juin 2024')).toBeDefined();
    expect(screen.getByText('juillet 2024')).toBeDefined();
    expect(screen.getByText('3 jours')).toBeDefined();
    expect(screen.getByText('1 juil. 2024 → 3 juil. 2024')).toBeDefined();
    expect(screen.getByText('1 jour')).toBeDefined();
    expect(screen.getByText('92.5 %')).toBeDefined();
    expect(screen.getByText('depuis le 1 janv. 2024')).toBeDefined();
  });

  it('should leave out the streaks and the autonomous month when there are none', () => {
    renderCard({ longestStreak: null, currentStreak: null, mostAutonomousMonth: null });

    expect(screen.queryByText('Plus longue série autonome')).toBeNull();
    expect(screen.queryByText('Série autonome en cours')).toBeNull();
    expect(screen.queryByText('Mois le plus autonome')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('should open the day, the month, the streak or the whole history', () => {
    const { onSelectRange, onSelectMonth, onSelectAll } = renderCard();

    fireEvent.click(screen.getByRole('button', { name: /Meilleur jour/ }));
    expect(onSelectRange).toHaveBeenLastCalledWith('2024-06-21', '2024-06-21');

    fireEvent.click(screen.getByRole('button', { name: /Plus longue série/ }));
    expect(onSelectRange).toHaveBeenLastCalledWith('2024-07-01', '2024-07-03');

    fireEvent.click(screen.getByRole('button', { name: /Meilleur mois/ }));
    expect(onSelectMonth).toHaveBeenLastCalledWith('2024-07');

    fireEvent.click(screen.getByRole('button', { name: /Production totale/ }));
    expect(onSelectAll).toHaveBeenCalledOnce();
  });
});
