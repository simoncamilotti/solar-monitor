import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { parseISO } from 'date-fns';
import { useState } from 'react';

import { DateRangePicker } from './date-range-picker.js';

const onChange = vi.fn();

const StatefulPicker = () => {
  const [range, setRange] = useState<[string | null, string | null]>([null, null]);
  return (
    <DateRangePicker
      startDate={range[0]}
      endDate={range[1]}
      minDate={parseISO('2025-08-01')}
      maxDate={parseISO('2025-08-20')}
      placeholder="Choisir"
      onChange={(start, end) => {
        onChange(start, end);
        setRange([start, end]);
      }}
    />
  );
};

const day = (date: string) => {
  const button = document.querySelector<HTMLButtonElement>(`[data-day="${date}"]`);
  if (!button) throw new Error(`No day ${date}`);
  return button;
};

describe('DateRangePicker', () => {
  beforeEach(() => onChange.mockClear());

  it('should pick a range in two clicks, in either order', async () => {
    render(<StatefulPicker />);
    fireEvent.click(screen.getByRole('button', { name: 'Choisir' }));

    fireEvent.click(day('14/08/2025'));
    expect(onChange).toHaveBeenLastCalledWith('2025-08-14', null);
    fireEvent.click(day('04/08/2025'));

    expect(onChange).toHaveBeenLastCalledWith('2025-08-04', '2025-08-14');
    await waitFor(() => expect(document.querySelector('[data-day]')).toBeNull());
    expect(screen.getByRole('button', { name: '4 août 2025 — 14 août 2025' })).toBeDefined();
  });

  it('should disable the days outside the history', () => {
    render(<StatefulPicker />);
    fireEvent.click(screen.getByRole('button', { name: 'Choisir' }));

    expect(day('20/08/2025').disabled).toBe(false);
    expect(day('21/08/2025').disabled).toBe(true);
  });
});
