import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Calendar } from 'lucide-react';
import { type FunctionComponent, type ReactNode, useState } from 'react';

type PickerDropdownProps = {
  label: string;
  children: (opts: { close: () => void }) => ReactNode;
};

const triggerClasses =
  'flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground hover:bg-muted aria-expanded:bg-muted transition-smooth focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20';

/** A button that opens a picker in a popover; Escape and a click outside close it. */
export const PickerDropdown: FunctionComponent<PickerDropdownProps> = ({ label, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={triggerClasses}>
        <Calendar className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span>{label}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        {children({ close: () => setOpen(false) })}
      </PopoverContent>
    </Popover>
  );
};
