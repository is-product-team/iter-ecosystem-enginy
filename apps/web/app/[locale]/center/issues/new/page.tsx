'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ISSUE_PRIORITIES, ISSUE_CATEGORIES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import issueService from '@/services/issueService';
import Loading from '@/components/Loading';

export default function NewIssuePage() {
  const t = useTranslations('Issues');
  const tCommon = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ca';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>(ISSUE_CATEGORIES.OTHER);
  const [priority, setPriority] = useState<any>(ISSUE_PRIORITIES.MEDIUM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || !user) {
    return <Loading fullScreen />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await issueService.create({
        title,
        description,
        category,
        priority,
        centerId: user.centerId || 0,
      });
      router.push(`/${locale}/center/issues`);
    } catch (err) {
      console.error(err);
      setError(tCommon('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title={t('new')}
      subtitle={t('subtitle')}
    >
      <div className="max-w-3xl mx-auto py-8">
        <form onSubmit={handleSubmit} className="bg-background-surface border border-border-subtle p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
              {t('form.title')} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium focus:border-consorci-darkBlue outline-none"
              required
              placeholder="Ex: Problema amb el material de robòtica"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                {t('form.category')} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium focus:border-consorci-darkBlue outline-none"
                required
              >
                {Object.values(ISSUE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`categories.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                {t('form.priority')} *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium focus:border-consorci-darkBlue outline-none"
                required
              >
                {Object.values(ISSUE_PRIORITIES).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
              {t('form.description')} *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium focus:border-consorci-darkBlue outline-none min-h-[150px] resize-none"
              required
              placeholder="Explica breument què ha passat..."
            />
          </div>

          <div className="flex justify-end gap-6 pt-6 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-[11px] font-bold text-text-muted hover:text-text-primary uppercase tracking-widest"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-10 py-3 bg-consorci-darkBlue text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? tCommon('loading') : t('form.submit')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
