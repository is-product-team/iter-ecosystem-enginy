// Reload trigger: 2026-04-09 10:35
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
  // En Next.js 15+ locale puede ser undefined en algunos contextos
  // We prioritize 'en' as the default language for the ecosystem
  const currentLocale = locale || 'en';
  
  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default
  };
});
