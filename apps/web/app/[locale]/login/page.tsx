'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import logoImg from '@/public/logo.png';
import { login as apiLogin } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { PHASES, ROLES } from '@iter/shared';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Auth.login');
  const tc = useTranslations('Common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfessorLink, setShowProfessorLink] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';
  const { user, login, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role.name === ROLES.ADMIN) {
        router.push(`/${locale}/admin`);
      } else if (user.role.name === ROLES.COORDINATOR) {
        router.push(`/${locale}/center`);
      }
    }
  }, [user, authLoading, router, locale]);

  if (authLoading) {
    return <Loading fullScreen message={t('loading')} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowProfessorLink(false);
    setLoading(true);

    try {
      const response = await apiLogin(email, password);
      const { user } = response;

      if (user.role.name === ROLES.TEACHER) {
        setShowProfessorLink(true);
      } else {
        login(user);
        if (user.role.name === ROLES.ADMIN) {
          router.push(`/${locale}/admin`);
        } else if (user.role.name === ROLES.COORDINATOR) {
          router.push(`/${locale}/center`);
        }
      }
    } catch (err) {
      const errorObj = err as { message: string };
      // Improved error messaging based on backend response or common errors
      if (errorObj.message.includes('401') || errorObj.message.toLowerCase().includes('invalid')) {
        setError(t('error'));
      } else if (errorObj.message.includes('fetch') || errorObj.message.includes('network')) {
        setError('Error de conexió. Si us plau, verifica si el servidor està actiu.');
      } else {
        setError(errorObj.message || 'S\x27ha produït un error inesperat.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background-page">
      <div className="w-full max-w-md bg-background-surface p-12 border border-border-subtle">
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-background-surface flex items-center justify-center mx-auto mb-6">
            <Image
              src={logoImg}
              alt="Iter Logo"
              width={128}
              height={128}
              priority
              className="w-full h-full object-contain dark:invert"
            />
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-text-primary leading-none">Iter</h2>
          <div className="h-0.5 w-8 bg-consorci-darkBlue mx-auto mt-4"></div>
          <p className="text-text-muted text-[12px] font-medium mt-6">Learning Management Platform</p>
        </div>

        {error && (
          <div className="bg-background-subtle border border-red-200/30 text-red-500 px-5 py-4 mb-8 text-xs font-medium flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {showProfessorLink ? (
          <div className="bg-background-subtle p-10 text-center animate-in fade-in zoom-in duration-300 border border-border-subtle">
            <h3 className="text-xl font-medium text-text-primary mb-4">Access via Mobile App</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-8">
              As a teacher, you must use the Iter mobile app to manage your sessions.
            </p>
            <a
              href="#"
              className="group relative flex items-center justify-center w-full py-4 bg-consorci-darkBlue text-white text-[13px] font-medium transition-all hover:bg-black active:scale-[0.98]"
              onClick={(e) => { e.preventDefault(); toast.info('Download link coming soon'); }}
            >
              <span>Download Iter App</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <button
              onClick={() => setShowProfessorLink(false)}
              className="mt-8 text-[12px] font-medium text-consorci-darkBlue hover:underline transition-all"
            >
              ← Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-text-primary text-[12px] font-medium px-1">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:bg-background-surface transition-all font-medium text-sm text-text-primary placeholder:text-text-muted outline-none"
                placeholder={t('email_placeholder')}
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-text-primary text-[12px] font-medium px-1">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:bg-background-surface transition-all font-medium text-sm text-text-primary placeholder:text-text-muted pr-12 outline-none"
                  placeholder={t('password_placeholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-consorci-darkBlue transition-colors p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26a4 4 0 015.493 5.493l-5.493-5.493z" clipRule="evenodd" />
                      <path d="M12.454 15.697A9.75 9.75 0 0110 16c-4.478 0-8.268-2.943-9.542-7a10.018 10.018 0 012.182-3.159L5.43 8.632A4 4 0 0010 13.5l2.454 2.197z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-consorci-darkBlue hover:bg-black text-white text-[13px] font-medium transition-all duration-300 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <Loading size="sm" white message="" />
                  <span>{t('loading')}</span>
                </>
              ) : t('submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
