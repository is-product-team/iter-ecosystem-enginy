'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  Check,
  Copy,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import Button from '../ui/Button';

interface SyncCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SyncCalendarModal({ isOpen, onClose }: SyncCalendarModalProps) {
  const t = useTranslations('Sync');
  const [syncToken, setSyncToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'notifications'>('calendar');

  useEffect(() => {
    if (isOpen) {
      fetchSyncToken();
    }
  }, [isOpen]);

  const fetchSyncToken = async () => {
    try {
      setLoading(true);
      const response = await api().get('/profile/sync-token');
      setSyncToken(response.data.syncToken);
    } catch (error) {
      console.error('Error fetching sync token:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async () => {
    if (!confirm(t('regenerate_confirm'))) return;

    setLoading(true);
    try {
      const response = await api().post('/profile/sync-token');
      setSyncToken(response.data.syncToken);
      toast.success(t('token_regenerated'));
    } catch (error) {
      toast.error(t('token_error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // URL Construction
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  // Clean apiUrl if it has /api prefix (typical in this project context)
  const domain = apiUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '');
  const protocol = apiUrl.startsWith('https') ? 'https' : 'http';

  const icalUrl = activeTab === 'calendar' 
    ? `${protocol}://${domain}/api/calendar/ics/${syncToken}`
    : `${protocol}://${domain}/api/notifications/ics/${syncToken}`;
  
  const webcalUrl = icalUrl.replace(/^https?/, 'webcal');
  const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(icalUrl)}`;

  const copyToClipboard = () => {
    if (!syncToken) return;
    navigator.clipboard.writeText(icalUrl);
    setCopying(true);
    toast.success(t(`${activeTab}_copy_success`));
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-background-surface border border-border-subtle shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-background-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-consorci-darkBlue/10 flex items-center justify-center text-consorci-darkBlue">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary tracking-tight">{t('modal_title')}</h3>
              <p className="text-xs text-text-muted mt-0.5">{t('modal_subtitle')}</p>
            </div>
          </div>
          <Button
            variant="subtle"
            size="sm"
            onClick={onClose}
            className="!p-2 text-text-muted hover:!text-text-primary hover:bg-background-surface"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-subtle bg-background-surface">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'calendar' 
                ? 'text-consorci-darkBlue border-b-2 border-consorci-darkBlue bg-consorci-darkBlue/5' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t('tab_calendar')}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'notifications' 
                ? 'text-consorci-darkBlue border-b-2 border-consorci-darkBlue bg-consorci-darkBlue/5' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t('tab_notifications')}
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loading size="md" message={t('obtaining_data')} />
            </div>
          ) : (
            <>
              {/* Buttons Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 p-4 bg-white border border-border-subtle hover:border-text-primary transition-all group shadow-sm"
                >
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-5 h-5" alt="Google" width={20} height={20} />
                  <span className="text-[13px] font-medium text-text-primary">{t('google_btn')}</span>
                </a>

                <a
                  href={webcalUrl}
                  className="flex items-center justify-center gap-3 p-4 bg-background-subtle border border-border-subtle hover:border-text-primary transition-all group shadow-sm"
                >
                  <Smartphone className="w-5 h-5 text-text-primary" />
                  <span className="text-[13px] font-medium text-text-primary">{t('apple_btn')}</span>
                </a>
              </div>

              {/* URL Section */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('copy_btn')}</label>
                <div className="flex items-center gap-2 p-1 border border-border-subtle bg-background-subtle">
                  <div className="flex-1 px-4 py-2 font-mono text-[11px] text-text-muted truncate">
                    {syncToken ? icalUrl : '••••••••••••••••••••••••••••••••'}
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant="subtle"
                    size="sm"
                    className="!p-2.5 bg-background-surface hover:bg-consorci-darkBlue hover:text-white border-l border-border-subtle !rounded-none"
                    title={t('copy_btn')}
                  >
                    {copying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Instructions Section */}
              <div className="p-6 bg-background-subtle border border-border-subtle space-y-4">
                <div className="flex items-center gap-2 text-consorci-darkBlue">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-[12px] font-bold uppercase tracking-wider">{t('instructions_title')}</h4>
                </div>
                <ul className="space-y-2">
                  <li className="text-[13px] text-text-muted flex gap-2">
                    <span className="text-consorci-darkBlue font-bold">1.</span>
                    {t('instructions_step1')}
                  </li>
                  <li className="text-[13px] text-text-muted flex gap-2">
                    <span className="text-consorci-darkBlue font-bold">2.</span>
                    {t('instructions_step2')}
                  </li>
                </ul>
                <p className="text-[11px] italic text-text-muted/80 mt-2 border-t border-border-subtle/50 pt-2">
                  {t('instructions_privacy')}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border-subtle bg-background-subtle flex justify-between items-center">
          <Button
            onClick={generateToken}
            variant="link"
            size="sm"
            loading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {t('regenerate_btn')}
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
          >
            {t('close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
