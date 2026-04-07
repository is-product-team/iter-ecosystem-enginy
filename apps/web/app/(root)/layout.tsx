import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';


const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Iter Web',
  description: 'Iter Web Application',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right" 
              offset={80}
              toastOptions={{
                className: 'font-bold uppercase text-[10px] tracking-widest',
                style: {
                  borderRadius: '0px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '16px',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}