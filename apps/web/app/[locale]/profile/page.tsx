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
import Button from '@/components/ui/Button';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { MapPin, Phone, Mail } from 'lucide-react';

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
  const [emailNotifications, setEmailNotifications] = useState((user as any)?.emailNotificationsEnabled ?? true);
  const [updatingNotifications, setUpdatingNotifications] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateUser } = useAuth();

  // Synchronize notification state if user updates
  useEffect(() => {
    if (user) {
      setEmailNotifications((user as any).emailNotificationsEnabled ?? true);
    }
  }, [user]);

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

  const toggleEmailNotifications = async () => {
    const newValue = !emailNotifications;
    setUpdatingNotifications(true);
    try {
      await api().patch('/profile/settings', {
        emailNotificationsEnabled: newValue
      });
      setEmailNotifications(newValue);
      toast.success(t('notifications_updated'));
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error(t('notifications_error'));
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const handleUserUpdate = (updatedUserData: any) => {
    updateUser(updatedUserData);
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
            className="border-2 border-border-subtle shadow-lg"
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
          <Button 
            onClick={() => setIsEditModalOpen(true)}
            variant="primary"
          >
            {t('edit_profile')}
          </Button>
        </div>

        <EditProfileModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onUpdate={handleUserUpdate}
        />

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
                
                {user.role.name !== 'ADMIN' && (
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">{t('center_referent_label')}</label>
                    <div className="flex items-center gap-4 p-4 bg-background-subtle border border-border-subtle rounded-xl">
                      <Avatar 
                        url={user.center?.photoUrl} 
                        name={user.center?.name || 'Center'} 
                        size="lg" 
                        type="center" 
                        className="border border-border-subtle shadow-sm"
                      />
                      <div>
                        <p className="text-[15px] text-text-primary font-bold tracking-tight">
                          {user.center ? user.center.name : t('no_center_assigned')}
                        </p>
                        <p className="text-[11px] text-text-muted font-medium uppercase tracking-widest">
                          {user.center?.centerCode || '---'}
                        </p>
                      </div>
                    </div>

                    {user.center && (user.center.address || user.center.contactPhone || user.center.contactEmail) && (
                      <div className="mt-4 p-5 bg-background-surface border border-border-subtle rounded-xl space-y-4">
                        {user.center.address && (
                          <div className="flex items-start gap-3 group">
                            <div className="p-2 bg-background-subtle rounded-lg text-text-muted group-hover:text-text-primary transition-colors">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div>
                               <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] mb-0.5">{t('center_address')}</p>
                               <p className="text-[13px] text-text-primary font-medium leading-relaxed">{user.center.address}</p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {user.center.contactPhone && (
                            <div className="flex items-start gap-3 group">
                              <div className="p-2 bg-background-subtle rounded-lg text-text-muted group-hover:text-text-primary transition-colors">
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] mb-0.5">{t('center_phone')}</p>
                                <p className="text-[13px] text-text-primary font-medium">{user.center.contactPhone}</p>
                              </div>
                            </div>
                          )}
                          {user.center.contactEmail && (
                            <div className="flex items-start gap-3 group">
                              <div className="p-2 bg-background-subtle rounded-lg text-text-muted group-hover:text-text-primary transition-colors">
                                <Mail className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] mb-0.5">{t('center_email')}</p>
                                <p className="text-[13px] text-text-primary font-medium break-all">{user.center.contactEmail}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="text-[12px] text-text-muted mt-4 leading-relaxed italic opacity-70">
                      {t('center_usage_hint')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Security */}
            <div className="space-y-8">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.2em]">{t('security_label')}</h3>
              </div>
              
              <div className="bg-background-surface border border-border-subtle p-8 shadow-sm">
                <Button 
                  onClick={() => toast.info(t('coming_soon'))}
                  variant="outline"
                  fullWidth
                >
                  {t('change_password')}
                </Button>
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
                    {['system', 'light', 'dark'].map((id) => (
                      <Button
                        key={id}
                        onClick={() => setTheme(id)}
                        variant={mounted && theme === id ? 'primary' : 'outline'}
                        size="sm"
                      >
                        {t(`themes.${id}`)}
                      </Button>
                    ))}
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">{t('language')}</label>
                  <LanguageSelector />
                </div>

                {/* Notification Settings */}
                <div className="pt-6 border-t border-border-subtle">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">{t('notifications_label')}</label>
                  <div className="flex items-center justify-between p-4 bg-background-subtle border border-border-subtle group hover:border-text-primary transition-all">
                    <div>
                      <p className="text-[14px] font-medium text-text-primary">{t('email_notifications_title')}</p>
                      <p className="text-[12px] text-text-muted">{t('email_notifications_desc')}</p>
                    </div>
                    <button
                      onClick={toggleEmailNotifications}
                      disabled={updatingNotifications}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        emailNotifications ? 'bg-consorci-darkBlue' : 'bg-border-subtle'
                      } ${updatingNotifications ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
