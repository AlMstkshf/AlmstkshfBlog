import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface BreadcrumbItem {
  name: string;
  nameAr?: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const { language, isRTL } = useLanguage();

  if (!items.length) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-1 text-sm text-slate-600 ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {items.map((item, index) => (
        <div key={item.url} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          {index > 0 && (
            <ChevronRight className={`h-4 w-4 mx-1 ${isRTL ? 'rotate-180' : ''} text-slate-400`} />
          )}
          {index === items.length - 1 ? (
            <span className={`text-slate-900 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' && item.nameAr ? item.nameAr : item.name}
            </span>
          ) : (
            <Link href={item.url}>
              <span className={`hover:text-primary transition-colors cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' && item.nameAr ? item.nameAr : item.name}
              </span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}