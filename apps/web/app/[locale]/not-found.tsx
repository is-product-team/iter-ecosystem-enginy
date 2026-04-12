import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
      <h2 className="text-2xl font-medium text-text-primary mb-6">
        {t('title')}
      </h2>
      <p className="text-text-muted mb-8 max-w-md">
        {t('description')}
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-primary text-white font-medium hover:bg-primary-hover transition-colors rounded-none"
      >
        {t('goHome')}
      </Link>
    </div>
  );
}
