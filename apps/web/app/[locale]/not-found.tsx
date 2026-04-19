import Navbar from '@/components/Navbar';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('NotFound');

  // [DEVELOPER NOTE]: Place your file in 'apps/web/public/404.gif'
  const GIF_SRC = "/404.gif"; 

  return (
    <div className="min-h-screen flex flex-col bg-background-page animate-in fade-in duration-700">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full flex flex-col items-center">
          <h1 className="text-4xl font-medium text-text-primary tracking-tighter mb-4">
            {t('title')}
          </h1>
          
          <p className="text-[14px] font-medium text-text-muted max-w-sm mb-12 leading-relaxed">
            {t('description')}
          </p>

          {/* Simplified GIF Container */}
          <div className="w-48 mb-12">
            <img 
              src={GIF_SRC} 
              alt="Not Found" 
              className="w-full"
            />
          </div>

          <Link 
            href="/"
            className="btn-primary"
          >
            {t('goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

