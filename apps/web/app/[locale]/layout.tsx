import type { Metadata } from 'next';
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import '@/config/env';
import '../globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '700'],
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-ibm-arabic',
});

export const metadata: Metadata = {
  title: 'Iter Web',
  description: 'Iter Web Application',
  icons: {
    icon: '/logo.png',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const isRtl = locale === 'ar';

  return (
    <html 
      lang={locale} 
      dir={isRtl ? 'rtl' : 'ltr'} 
      suppressHydrationWarning 
      className={`${inter.variable} ${ibmPlexArabic.variable}`}
    >
      <body className={`antialiased ${isRtl ? 'font-arabic' : 'font-sans'}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
              <Toaster 
                position="top-right" 
                offset={80}
                toastOptions={{
                  className: 'text-[13px] font-medium transition-all',
                  style: {
                    borderRadius: '0px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    padding: '16px',
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
