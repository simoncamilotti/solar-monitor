import 'react-datepicker/dist/react-datepicker.css';

import { Calendar } from 'lucide-react';
import { type FunctionComponent, type ReactNode, useEffect, useRef, useState } from 'react';

type PickerDropdownProps = {
  label: string;
  children: (opts: { close: () => void }) => ReactNode;
};

const triggerClasses =
  'flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/20';

export const PickerDropdown: FunctionComponent<PickerDropdownProps> = ({ label, children }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen(prev => !prev)} className={triggerClasses}>
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span>{label}</span>
      </button>

      {open && <div className="absolute top-full left-0 mt-2 z-50">{children({ close: () => setOpen(false) })}</div>}
    </div>
  );
};
