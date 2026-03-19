import type { FunctionComponent, ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  trailing?: ReactNode;
};

export const PageHeader: FunctionComponent<PageHeaderProps> = ({ title, description, icon, trailing }) => (
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
    {trailing}
  </div>
);
