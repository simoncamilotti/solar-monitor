import type { FunctionComponent, ReactNode } from 'react';

export type PageHeaderAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: PageHeaderAction;
  trailing?: ReactNode;
};

export const PageHeader: FunctionComponent<PageHeaderProps> = ({ title, description, icon, action, trailing }) => (
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.disabled}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {action.icon}
          {action.label}
        </button>
      )}
      {trailing}
    </div>
  </div>
);
