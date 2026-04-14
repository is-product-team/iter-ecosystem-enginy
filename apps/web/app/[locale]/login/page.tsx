'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import logoImg from '@/public/logo.png';
import logoInversImg from '@/public/logo-invers.png';
import { login as apiLogin } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { PHASES, ROLES } from '@iter/shared';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Building2, ShieldCheck, Smartphone, ArrowRight, ArrowLeft, X } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('Auth.login');
  const tc = useTranslations('Common');
  const [showInfo, setShowInfo] = useState(false);
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
      if (errorObj.message.includes('401') || errorObj.message.toLowerCase().includes('invalid')) {
        setError(t('error'));
      } else if (errorObj.message.includes('fetch') || errorObj.message.includes('network')) {
        setError(tc('error_connectivity'));
      } else {
        setError(errorObj.message || tc('loading_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 bg-background-page selection:bg-consorci-darkBlue/10 overflow-hidden">
      {/* Login Card */}
      <div className="w-full max-w-[440px] bg-background-surface p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-background-surface flex items-center justify-center mx-auto mb-6">
            <Image
              src={logoImg}
              alt="Iter Logo"
              width={100}
              height={100}
              priority
              className="w-full h-full object-contain block dark:hidden scale-90"
            />
            <Image
              src={logoInversImg}
              alt="Iter Logo"
              width={100}
              height={100}
              priority
              className="w-full h-full object-contain hidden dark:block scale-90"
            />
          </div>
          <h2 className="text-[32px] font-semibold tracking-tighter text-text-primary mb-1">Iter</h2>
          <p className="text-text-muted text-[13px] font-medium opacity-60 px-4">
            {t('tagline')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/5 border border-red-200/20 text-red-600 dark:text-red-400 px-5 py-4 mb-8 text-[13px] font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {showProfessorLink ? (
          <div className="bg-background-subtle/50 p-10 text-center border border-black/5 dark:border-white/5 animate-in fade-in zoom-in-95 duration-500">
            <h3 className="text-xl font-semibold text-text-primary mb-4">{t('access_mobile')}</h3>
            <p className="text-[13px] text-text-muted leading-relaxed mb-8 opacity-80">
              {t('teacher_mobile_hint')}
            </p>
            <a
              href="#"
              className="group flex items-center justify-center w-full py-4 bg-consorci-darkBlue text-white text-[13px] font-bold tracking-tight hover:bg-black transition-all active:scale-[0.98]"
              onClick={(e) => { e.preventDefault(); toast.info(t('pdf_not_implemented')); }}
            >
              <span>{t('download_app')}</span>
            </a>
            <button
              onClick={() => setShowProfessorLink(false)}
              className="mt-8 text-[13px] font-semibold text-consorci-darkBlue hover:underline underline-offset-4"
            >
              {t('back_to_login')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-text-primary text-[11px] uppercase tracking-widest font-bold opacity-50 px-1">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-background-subtle/30 border border-black/5 dark:border-white/5 focus:border-consorci-darkBlue/30 focus:bg-background-surface transition-all font-medium text-[15px] text-text-primary placeholder:opacity-30 outline-none"
                placeholder={t('email_placeholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-text-primary text-[11px] uppercase tracking-widest font-bold opacity-50 px-1">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-background-subtle/30 border border-black/5 dark:border-white/5 focus:border-consorci-darkBlue/30 focus:bg-background-surface transition-all font-medium text-[15px] text-text-primary placeholder:opacity-30 pr-12 outline-none"
                  placeholder={t('password_placeholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-consorci-darkBlue transition-colors p-1 opacity-40 hover:opacity-100"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-consorci-darkBlue hover:bg-black text-white text-[13px] font-bold tracking-tight transition-all duration-300 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center min-h-[52px]"
              >
                {loading ? (
                  <Loading size="mini" white message="" />
                ) : (
                  <span>{t('submit')}</span>
                )}
              </button>
            </div>

            <div className="text-center pt-8 border-t border-black/[0.03] dark:border-white/[0.03]">
              <button 
                type="button"
                onClick={() => setShowInfo(true)}
                className="text-[13px] font-semibold text-text-muted hover:text-consorci-darkBlue transition-colors"
              >
                {t('no_account_link')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-xl"
            onClick={() => setShowInfo(false)}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-[860px] bg-background-surface p-10 md:p-14 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 overflow-hidden">
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute right-6 top-6 p-2 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-black/5"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-14">
              <h3 className="text-[28px] font-semibold tracking-tight text-text-primary mb-4">
                {t('register_info.title')}
              </h3>
              <div className="h-0.5 w-12 bg-consorci-darkBlue/20 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 mb-4">
              {/* Coordinator */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-consorci-darkBlue/[0.03] dark:bg-white/[0.02] flex items-center justify-center mb-6 text-consorci-darkBlue transition-transform group-hover:scale-110 duration-500">
                  <Building2 size={28} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-[16px] mb-4 tracking-tight">{t('register_info.coordinator.title')}</h4>
                <p className="text-[13px] leading-relaxed text-text-muted opacity-80">
                  {t('register_info.coordinator.desc')}
                </p>
              </div>

              {/* Admin */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-consorci-darkBlue/[0.03] dark:bg-white/[0.02] flex items-center justify-center mb-6 text-consorci-darkBlue transition-transform group-hover:scale-110 duration-500">
                  <ShieldCheck size={28} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-[16px] mb-4 tracking-tight">{t('register_info.admin.title')}</h4>
                <p className="text-[13px] leading-relaxed text-text-muted opacity-80">
                  {t('register_info.admin.desc')}
                </p>
              </div>

              {/* Teacher */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-consorci-darkBlue/[0.03] dark:bg-white/[0.02] flex items-center justify-center mb-6 text-consorci-darkBlue transition-transform group-hover:scale-110 duration-500">
                  <Smartphone size={28} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-[16px] mb-4 tracking-tight">{t('register_info.teacher.title')}</h4>
                <p className="text-[13px] leading-relaxed text-text-muted opacity-80">
                  {t('register_info.teacher.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
