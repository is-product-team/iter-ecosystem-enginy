// Reload trigger: 2026-04-09 10:35
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // En Next.js 15+ el parámetro se llama requestLocale y es una Promesa
  let locale = await requestLocale;
  
  // Validar el idioma o usar el por defecto si es undefined o no soportado
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  console.log(`[i18n] Resolved locale: "${locale}"`);

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      locale: locale as string,
      messages
    };
  } catch (error) {
    console.error(`[i18n] Failed to load messages for locale: "${locale}"`, error);
    // Fallback al castellano si el idioma solicitado falla
    const fallbackMessages = (await import('../messages/es.json')).default;
    return {
      locale: 'es',
      messages: fallbackMessages
    };
  }
});
