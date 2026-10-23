import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { i18n } from '../../../i18n/i18n.js';
import { MonthPicker } from './month-picker.js';

const renderPicker = () => {
  const onChange = vi.fn();
  render(
    <MonthPicker
      inputYear={2025}
      inputMonth={7}
      availableYears={[2024, 2025]}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /août 2025/i }));
  return onChange;
};

describe('MonthPicker', () => {
  it('should mark the current month and pick another one', async () => {
    const onChange = renderPicker();

    expect(screen.getByRole('button', { name: 'août', pressed: true })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'mars' }));

    expect(onChange).toHaveBeenCalledWith('2025-03');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'mars' })).toBeNull());
  });

  it('should stop at the years of the history', () => {
    renderPicker();
    const next = screen.getByRole('button', { name: i18n.t('picker.nextYear') });
    const previous = screen.getByRole('button', { name: i18n.t('picker.previousYear') });

    expect((next as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(previous);
    expect(screen.getByText('2024')).toBeDefined();
    expect((previous as HTMLButtonElement).disabled).toBe(true);
  });

  it('should close on Escape', async () => {
    renderPicker();

    fireEvent.keyDown(screen.getByRole('button', { name: 'mars' }), { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('button', { name: 'mars' })).toBeNull());
  });
});
