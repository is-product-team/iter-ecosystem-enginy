'use client';

import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Avatar from '@/components/Avatar';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/services/api';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from '@/i18n/routing';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('Profile');
  const tc = useTranslations('Common');
  const [syncToken, setSyncToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchSyncToken();
    }
  }, [user]);

  const fetchSyncToken = async () => {
    try {
      const response = await api().get('/profile/sync-token');
      setSyncToken(response.data.syncToken);
    } catch (error) {
      console.error('Error fetching sync token:', error);
    }
  };

  const generateToken = async () => {
    setLoadingToken(true);
    try {
      const response = await api().post('/profile/sync-token');
      setSyncToken(response.data.syncToken);
      toast.success(t('sync_success'));
    } catch (error) {
      console.error('Error generating sync token:', error);
      toast.error(t('sync_error'));
    } finally {
      setLoadingToken(false);
    }
  };



  if (!mounted || authLoading || !user) {
    return (
      <Loading fullScreen message={authLoading ? tc('authenticating') : tc('loading')} />
    );
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="w-full pb-20 space-y-12">
        {/* Profile Header Card */}
        <div className="bg-background-surface border border-border-subtle p-12 mb-10 flex flex-col md:flex-row items-center gap-10">
          <Avatar 
            url={user.photoUrl} 
            name={user.fullName} 
            id={user.userId} 
            type="user" 
            size="xl" 
            email={user.email}
            className="border-2 border-border-subtle"
          />
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-medium text-text-primary mb-2 tracking-tight">{user.fullName}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="px-4 py-1.5 bg-consorci-darkBlue/5 border border-consorci-darkBlue/20 text-consorci-darkBlue text-[11px] font-bold uppercase tracking-widest">
                {tc(`roles.${user.role.name}`)}
              </span>
              {user.center && (
                <span className="px-4 py-1.5 bg-background-subtle border border-border-subtle text-text-muted text-[11px] font-bold uppercase tracking-widest">
                  {user.center.name}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => toast.info(t('coming_soon'))}
            className="px-8 py-3 bg-consorci-darkBlue hover:bg-black text-white text-[13px] font-medium transition-all active:scale-[0.95]"
          >
            {t('edit_profile')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Column 1: Info */}
          <div className="space-y-10">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.2em]">{t('contact_info_label')}</h3>
              </div>
              
              <div className="space-y-6 bg-background-surface border border-border-subtle p-8 shadow-sm">
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">{t('email_label')}</label>
                  <p className="text-[14px] text-text-primary font-medium">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">{t('center_referent_label')}</label>
                  <p className="text-[14px] text-text-primary font-medium">
                    {user.center ? user.center.name : t('no_center_assigned')}
                  </p>
                  <p className="text-[12px] text-text-muted mt-2 leading-relaxed">
                    {t('center_usage_hint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-8">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.2em]">{t('security_label')}</h3>
              </div>
              
              <div className="bg-background-surface border border-border-subtle p-8 shadow-sm">
                <button 
                  onClick={() => toast.info(t('coming_soon'))}
                  className="w-full py-3 bg-background-subtle border border-border-subtle text-text-primary hover:border-text-primary text-[13px] font-medium transition-all"
                >
                  {t('change_password')}
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: App & Settings */}
          <div className="space-y-10">
            {/* Platform Settings */}
            <div className="space-y-8">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.2em]">{t('platform_settings')}</h3>
              </div>
              
              <div className="space-y-8 bg-background-surface border border-border-subtle p-8 shadow-sm">
                {/* Theme Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">{t('appearance_label')}</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'system', label: t('themes.system') },
                      { id: 'light', label: t('themes.light') },
                      { id: 'dark', label: t('themes.dark') }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={`px-4 py-2 text-[12px] font-medium border transition-all ${
                          mounted && theme === option.id 
                            ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue' 
                            : 'bg-background-subtle border-border-subtle text-text-primary hover:border-text-primary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">{t('language')}</label>
                  <LanguageSelector />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
