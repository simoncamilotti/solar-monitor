import { ChevronRight } from 'lucide-react';
import type { FunctionComponent } from 'react';
import type { To } from 'react-router';
import { Link } from 'react-router';

export type BreadcrumbItemProps = { title: string; to?: To };
export type BreadcrumbItemsProps = BreadcrumbItemProps[];

const BreadcrumbItem: FunctionComponent<{ breadcrumbItem: BreadcrumbItemProps }> = ({ breadcrumbItem }) => {
  if (breadcrumbItem.to != null) {
    return (
      <li className={'inline-flex items-center gap-1.5'}>
        <Link to={breadcrumbItem.to} className={'transition-colors hover:text-foreground'}>
          {breadcrumbItem.title}
        </Link>
        <span className={'[&>svg]:size-3.5'}>
          <ChevronRight />
        </span>
      </li>
    );
  }

  return (
    <li className={'inline-flex items-center gap-1.5'}>
      <span className={'text-foreground'}>{breadcrumbItem.title}</span>
    </li>
  );
};

export const PageBreadcrumb: FunctionComponent<{ breadcrumbItems: BreadcrumbItemsProps }> = ({ breadcrumbItems }) => {
  return (
    <div className="h-10 flex items-center border-b border-border/50 bg-card/50 no-print">
      <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
        {breadcrumbItems.map((breadcrumbItem, index) => (
          <BreadcrumbItem key={index} breadcrumbItem={breadcrumbItem} />
        ))}
      </ol>
    </div>
  );
};
