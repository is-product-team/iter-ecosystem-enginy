'use client';

import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { ROLES } from '@iter/shared';
import Avatar from '@/components/Avatar';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Copy, RefreshCw, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import getApi from '@/services/api';

function CalendarSyncSection() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchToken = useCallback(async () => {
    try {
      const api = getApi();
      const res = await api.get('/profile/sync-token');
      setToken(res.data.sync_token);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateToken = async () => {
    setRegenerating(true);
    try {
      const api = getApi();
      const res = await api.post('/profile/sync-token');
      setToken(res.data.sync_token);
    } catch (e) {
      console.error(e);
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const syncUrl = token ? `${process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : '')}/calendar/sync/${token}.ics` : '';

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(syncUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-[10px] font-black text-consorci-darkBlue uppercase tracking-widest">
        Sincronització de Calendari (iCal)
      </label>
      <div className="p-6 bg-consorci-darkBlue/5 border-2 border-consorci-darkBlue/10 rounded-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-consorci-darkBlue text-white flex items-center justify-center shrink-0 shadow-lg">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">Sincronitza amb Google/Apple</h4>
            <p className="text-[10px] text-text-muted font-bold leading-relaxed mt-1">
              Subscriu-te des del teu sistema favorit per veure totes les fites i sessions automàticament.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-10 bg-background-subtle animate-pulse rounded-sm w-full"></div>
        ) : !token ? (
          <button
            onClick={generateToken}
            disabled={regenerating}
            className="w-full py-3 bg-consorci-darkBlue text-white text-[10px] font-black uppercase tracking-widest hover:bg-consorci-actionBlue transition-all flex items-center justify-center gap-2"
          >
            {regenerating ? <RefreshCw className="animate-spin w-4 h-4" /> : <RefreshCw size={16} />}
            Activar Sincronització
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 bg-background-surface border border-border-subtle p-3 text-[10px] font-mono text-text-muted truncate">
                {syncUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className={`px-4 flex items-center justify-center transition-all ${copied ? 'bg-green-600 text-white' : 'bg-consorci-darkBlue text-white hover:bg-consorci-actionBlue'}`}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-text-muted italic">Sincronització activa ✓</span>
              <button
                onClick={generateToken}
                disabled={regenerating}
                className="text-[9px] font-black text-consorci-pinkRed uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                {regenerating && <RefreshCw className="animate-spin w-3 h-3" />}
                Regenerar Link
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border border-border-subtle bg-background-subtle/50 space-y-3">
        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Preferències de Notificació</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-text-primary">Avisos de Sessió (24h abans)</span>
          <div className="w-10 h-5 bg-consorci-darkBlue rounded-full relative px-1 flex items-center">
            <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-1"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-text-primary">Canvis en Dates de Fases</span>
          <div className="w-10 h-5 bg-consorci-darkBlue rounded-full relative px-1 flex items-center">
            <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !user) {

    return (
      <div className="flex min-h-screen justify-center items-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00426B] mx-auto"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Manage your personal information and academy preferences."
    >
      <div className="w-full">
        <div className="bg-background-surface shadow-sm border border-border-subtle overflow-hidden">
          {/* Header/Cover */}
          <div className="h-32 bg-consorci-darkBlue"></div>

          <div className="px-8 pb-10 relative">
            {/* Avatar */}
            <div className="absolute -top-12 left-8">
              <Avatar
                url={user.photoUrl}
                name={user.fullName}
                id={user.id_user}
                type="usuari"
                size="xl"
                className="ring-4 ring-white shadow-xl"
                isCoordinator={user.role.name === ROLES.COORDINATOR}
                email={user.email}
              />
            </div>

            <div className="pt-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-text-primary leading-tight">
                    {user.fullName}
                  </h3>
                  <p className="text-consorci-actionBlue font-bold tracking-tight uppercase text-xs mt-1">
                    {user.role.name} {user.center?.name ? `• ${user.center.name}` : ''}
                  </p>
                </div>

                <button className="px-6 py-3 bg-background-subtle text-text-muted font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-border-subtle">
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Contact Information</label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-background-subtle border border-border-subtle">
                        <div className="w-10 h-10 bg-background-surface flex items-center justify-center text-text-muted shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Email Address</p>
                          <p className="text-sm font-bold text-text-primary">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-background-subtle border border-border-subtle">
                        <div className="w-10 h-10 bg-background-surface flex items-center justify-center text-text-muted shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Phone Number</p>
                          <p className="text-sm font-bold text-text-primary">{user.phone || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Referent Center</label>
                    <div className="p-4 border-2 border-dashed border-border-subtle bg-background-subtle/30">
                      <p className="text-sm font-bold text-text-primary">{user.center?.name || 'No center assigned'}</p>
                      <p className="text-xs text-text-muted mt-1">Used for workshop management and requests.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Security</label>
                    <button className="w-full flex items-center justify-between p-4 bg-background-subtle hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background-surface flex items-center justify-center text-gray-400 shadow-sm group-hover:bg-[#00426B] group-hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <span className="text-sm font-bold text-text-secondary">Change Password</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Interface Appearance</label>
                    <div className="flex border border-border-subtle p-0.5 max-w-sm">
                      {[
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'system', label: 'System', icon: Monitor },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isActive = mounted && theme === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`flex-1 flex items-center justify-center py-2 gap-2 transition-all ${isActive
                                ? 'bg-consorci-darkBlue text-white'
                                : 'text-text-muted hover:text-text-secondary hover:bg-background-subtle'
                              }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sincronització de Calendari */}
                  <CalendarSyncSection />



                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
