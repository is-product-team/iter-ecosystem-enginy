'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { id: 'ca', label: 'Català', flag: 'CA' },
  { id: 'es', label: 'Castellano', flag: 'ES' },
  { id: 'en', label: 'English', flag: 'GB' },
  { id: 'ar', label: 'العربية', flag: 'SA' }
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('Common');

  const activeLanguage = LANGUAGES.find(lang => lang.id === currentLocale) || LANGUAGES[1];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (locale: string) => {
    setIsOpen(false);
    if (locale === currentLocale) return;
    router.replace(pathname, { locale });
  };

  const handleReset = () => {
    setIsOpen(false);
    document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-background-surface border border-border-subtle hover:border-text-primary transition-all duration-300 shadow-sm group"
      >
        <Globe size={16} className="text-text-muted group-hover:text-text-primary transition-colors" />
        <span className="text-[13px] font-medium text-text-primary">{activeLanguage.label}</span>
        <ChevronDown 
          size={14} 
          className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 right-0 ltr:right-0 rtl:left-0 bg-background-page/95 backdrop-blur-xl border border-border-subtle shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-border-subtle mb-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('select_language')}</span>
            </div>
            
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-consorci-darkBlue hover:text-white transition-colors group ${
                  currentLocale === lang.id ? 'bg-consorci-darkBlue/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[13px] ${currentLocale === lang.id ? 'font-bold' : 'font-medium'}`}>
                    {lang.label}
                  </span>
                </div>
                {currentLocale === lang.id && (
                  <Check size={14} className="text-consorci-darkBlue group-hover:text-white" />
                )}
              </button>
            ))}

            <div className="border-t border-border-subtle mt-1 pt-1">
              <button
                onClick={handleReset}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background-subtle transition-colors text-text-muted hover:text-text-primary"
              >
                <div className="w-5 flex justify-center">
                  <span className="text-[10px] opacity-60">⚙️</span>
                </div>
                <span className="text-[12px] font-medium italic">{t('system_default')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
