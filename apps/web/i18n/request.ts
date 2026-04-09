import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
  // En Next.js 15+ locale puede ser undefined en algunos contextos
  // We prioritize 'es' as the default language for the ecosystem
  const currentLocale = locale || 'es';
  
  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default
  };
});
