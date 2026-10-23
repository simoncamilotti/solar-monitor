import { Button } from '@repo/ui/components/button';
import type { FunctionComponent, ReactNode } from 'react';

type PickerGridItem = {
  key: string | number;
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

type PickerGridProps = {
  items: PickerGridItem[];
  /** Above the grid, e.g. the year of a month grid with its navigation. */
  header?: ReactNode;
};

/** A grid of months or years, in the style of the day calendar. */
export const PickerGrid: FunctionComponent<PickerGridProps> = ({ items, header }) => (
  <div className="flex w-56 flex-col gap-2 p-2">
    {header}
    <div className="grid grid-cols-3 gap-1">
      {items.map((item) => (
        <Button
          key={item.key}
          type="button"
          variant="ghost"
          aria-pressed={item.selected}
          disabled={item.disabled}
          onClick={item.onSelect}
          className="h-9 font-normal capitalize aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/80"
        >
          {item.label}
        </Button>
      ))}
    </div>
  </div>
);
