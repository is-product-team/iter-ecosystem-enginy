'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Avatar from '@/components/Avatar';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/services/api';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('Profile');
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
      toast.success('Sync token generated successfully');
    } catch (error) {
      console.error('Error generating sync token:', error);
      toast.error('Failed to generate sync token');
    } finally {
      setLoadingToken(false);
    }
  };

  const changeLanguage = (newLocale: string) => {
    // next-intl uses the locale as the first path segment
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  if (authLoading || !user) {
    return (
      <Loading fullScreen message="Loading profile..." />
    );
  }

  return (
    <DashboardLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="max-w-4xl mx-auto pb-20">
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
                {user.role.name}
              </span>
              {user.center && (
                <span className="px-4 py-1.5 bg-background-subtle border border-border-subtle text-text-muted text-[11px] font-bold uppercase tracking-widest">
                  {user.center.name}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => toast.info('Profile editing coming soon')}
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
                  onClick={() => toast.info('Password change coming soon')}
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
                <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.2em]">Platform Settings</h3>
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
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Language</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'ca', label: 'Català' },
                      { id: 'es', label: 'Castellano' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => changeLanguage(option.id)}
                        className={`px-4 py-2 text-[12px] font-medium border transition-all ${
                          currentLocale === option.id 
                            ? 'bg-consorci-darkBlue text-white border-consorci-darkBlue' 
                            : 'bg-background-subtle border-border-subtle text-text-primary hover:border-text-primary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* App Synchronization */}
            <div className="space-y-8">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.2em]">App Synchronization</h3>
              </div>
              
              <div className="space-y-6 bg-background-surface border border-border-subtle p-8 shadow-sm">
                <p className="text-[12px] text-text-muted leading-relaxed">
                  Use this token to sync your account with the Iter mobile app. Keep this token private.
                </p>
                
                {syncToken ? (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-background-subtle border border-border-subtle font-mono text-center break-all text-xs select-all">
                      {syncToken}
                    </div>
                    <button 
                      onClick={generateToken}
                      disabled={loadingToken}
                      className="text-[12px] font-medium text-consorci-darkBlue hover:underline transition-all text-left"
                    >
                      {loadingToken ? 'Generating...' : 'Regenerate Token'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={generateToken}
                    disabled={loadingToken}
                    className="w-full py-3 border border-consorci-darkBlue text-consorci-darkBlue hover:bg-consorci-darkBlue hover:text-white text-[13px] font-medium transition-all"
                  >
                    {loadingToken ? 'Generating...' : 'Generate Sync Token'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
