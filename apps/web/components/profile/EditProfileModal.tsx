'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import api from '../../services/api';
import { toast } from 'sonner';
import Button from '../ui/Button';
import Avatar from '../Avatar';
import { User } from '@/lib/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updatedUser: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const t = useTranslations('Profile.edit_modal');
  const tCommon = useTranslations('Common');
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone || '');
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api().patch('/profile/settings', {
        fullName,
        email,
        phone
      });

      if (response.data.success) {
        toast.success(t('success_message'));
        onUpdate(response.data.user);
        onClose();
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.error || t('error_message');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background-surface border border-border-subtle max-w-lg w-full overflow-hidden animate-in zoom-in fade-in duration-200 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="bg-background-subtle px-8 py-5 border-b border-border-subtle flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium text-text-primary uppercase tracking-tight">
              {t('title')}
            </h2>
            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest opacity-70">
              {t('subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50/50 border border-red-200 p-4 animate-in slide-in-from-top-2 border-l-4 border-l-red-500">
                <p className="text-xs text-red-600 font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="flex flex-col items-center pb-8 border-b border-border-subtle/50 mb-4">
              <Avatar 
                url={user.photoUrl} 
                name={fullName} 
                id={user.userId}
                size="xl" 
                type="user" 
                editable
                onUpload={(newUrl) => onUpdate({ ...user, photoUrl: newUrl })}
                className="border-2 border-border-subtle shadow-md"
              />
              <div className="mt-4 text-center">
                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.25em]">
                  {tCommon(`roles.${user.role.name}`)}
                </p>
                {user.center && (
                  <p className="text-[9px] text-text-muted mt-1 font-medium uppercase tracking-widest italic">
                    {user.center.name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 group-focus-within:text-consorci-darkBlue transition-colors">
                  {t('fullname_label')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-4 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary transition-all outline-none focus:ring-0"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 group-focus-within:text-consorci-darkBlue transition-colors">
                  {t('email_label')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary transition-all outline-none focus:ring-0"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 group-focus-within:text-consorci-darkBlue transition-colors">
                  {t('phone_label')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary transition-all outline-none focus:ring-0"
                  placeholder={t('phone_placeholder')}
                />
              </div>
            </div>
          </div>

          <div className="bg-background-subtle px-8 py-6 border-t border-border-subtle flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              fullWidth
              disabled={loading}
              className="font-bold tracking-widest uppercase text-[11px]"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="font-bold tracking-widest uppercase text-[11px]"
            >
              {t('save_btn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
