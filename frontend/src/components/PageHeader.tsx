import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
};

export default function PageHeader({ title, subtitle, breadcrumb }: PageHeaderProps) {
  return (
    <div className="bg-white border border-slate-200 p-6 shadow-soft rounded-xl mb-10">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">Home</Link>
          {breadcrumb ? (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-slate-500">{breadcrumb}</span>
            </>
          ) : null}
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-slate-600 max-w-2xl">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}
