import { fireEvent, render, screen } from '@testing-library/react';

import type { LifetimeDay } from '@repo/contracts';

import { i18n } from '../../../i18n/i18n.js';
import { ComparisonEmptyState } from './comparison-empty-state.js';

const day = (date: string) =>
  ({
    date,
    kwhProduced: 10,
    kwhConsumed: 10,
    kwhImported: 5,
    kwhExported: 5,
    gridDependency: 50,
  }) satisfies LifetimeDay;

describe('ComparisonEmptyState', () => {
  it('should apply a ready-made comparison', () => {
    const onApplyPreset = vi.fn();
    render(
      <ComparisonEmptyState
        data={[day('2024-06-01'), day('2025-06-01')]}
        onApplyPreset={onApplyPreset}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: new RegExp(i18n.t('compare.presets.thisYearVsLastYear')),
      }),
    );

    expect(onApplyPreset).toHaveBeenCalledWith('years', [{ year: 2025 }, { year: 2024 }]);
  });

  it('should disable the comparisons the history is too short for', () => {
    render(<ComparisonEmptyState data={[day('2024-06-01')]} onApplyPreset={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(buttons.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it('should explain how to build a custom comparison', () => {
    render(<ComparisonEmptyState data={[]} onApplyPreset={vi.fn()} />);

    expect(screen.getByText(i18n.t('compare.empty.custom', { max: 4 }))).toBeDefined();
  });
});
