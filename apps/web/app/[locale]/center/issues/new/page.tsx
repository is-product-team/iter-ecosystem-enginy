'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ISSUE_PRIORITIES, ISSUE_CATEGORIES, ROLES } from '@iter/shared';
import DashboardLayout from '@/components/DashboardLayout';
import issueService from '@/services/issueService';
import Loading from '@/components/Loading';
import Button from '@/components/ui/Button';
import getApi from '@/services/api';
import { toast } from 'sonner';
import { FileIcon, X, Paperclip, Image as ImageIcon, Film, FileText, Plus } from 'lucide-react';
import Image from 'next/image';

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Attachments State
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (authLoading || !user) {
    return <Loading fullScreen />;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles].slice(0, 5)); // Limit to 5 files
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={16} className="text-blue-500" />;
    if (type.startsWith('video/')) return <Film size={16} className="text-purple-500" />;
    if (type === 'application/pdf') return <FileText size={16} className="text-red-500" />;
    return <FileIcon size={16} className="text-gray-500" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let uploadedAttachmentUrls: any[] = [];
      
      // 1. Upload files first if any
      if (attachments.length > 0) {
        setUploadingFiles(true);
        const formData = new FormData();
        attachments.forEach(file => formData.append('files', file));
        
        const api = getApi();
        const res = await api.post('/upload/multimedia', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedAttachmentUrls = res.data.files;
      }

      // 2. Create Issue with attachments
      await issueService.create({
        title,
        description,
        category,
        priority: ISSUE_PRIORITIES.MEDIUM,
        centerId: user.centerId || 0,
        attachments: uploadedAttachmentUrls
      });

      toast.success(t('create_success'));
      router.push(`/${locale}/center/issues`);
    } catch (err) {
      console.error(err);
      toast.error(tCommon('error'));
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
    }
  };

  return (
    <DashboardLayout
      title={t('new')}
      subtitle={t('subtitle')}
    >
      <div className="max-w-3xl mx-auto py-12 px-6">
        <form onSubmit={handleSubmit} className="bg-background-surface border border-border-subtle shadow-sm animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          
          <div className="p-8 sm:p-12 space-y-10">
            {/* Title Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block ml-1">
                {t('form.title')} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-border-subtle text-lg font-bold text-text-primary focus:border-consorci-darkBlue outline-none transition-all placeholder:text-text-muted/30"
                required
                placeholder="Títol de la incidència..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block ml-1">
                  {t('form.category')} *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-xs font-black uppercase tracking-widest text-text-primary focus:border-consorci-darkBlue outline-none appearance-none cursor-pointer"
                  required
                >
                  {Object.values(ISSUE_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block ml-1">
                {t('form.description')} *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-6 py-5 bg-background-subtle border border-border-subtle text-[14px] font-medium focus:border-consorci-darkBlue outline-none min-h-[220px] resize-none leading-relaxed"
                required
                placeholder="Explica detalladament què ha passat..."
              />
            </div>

            {/* Minimalist Multimedia Section */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                   <Paperclip size={14} className="text-consorci-darkBlue" />
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Fitxers adjunts</span>
                </div>
                <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   disabled={attachments.length >= 5}
                   className="text-[10px] font-black text-consorci-darkBlue uppercase tracking-widest hover:underline disabled:opacity-30 flex items-center gap-1.5"
                >
                   <Plus size={12} strokeWidth={3} />
                   Afegir multimedia
                </button>
              </div>

              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect}
                accept="image/*,video/*,application/pdf"
              />

              {attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="group relative aspect-square bg-background-subtle border border-border-subtle rounded-xl flex flex-col items-center justify-center p-2 transition-all hover:border-consorci-darkBlue/40 overflow-hidden shadow-sm">
                       {file.type.startsWith('image/') ? (
                         <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-lg" alt="preview" />
                       ) : (
                         <div className="flex flex-col items-center gap-2">
                            {getFileIcon(file.type)}
                            <span className="text-[8px] font-bold text-center truncate w-full px-2 uppercase">{file.name.split('.').pop()}</span>
                         </div>
                       )}
                       <button 
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-red-50"
                        >
                          <X size={12} />
                       </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="py-12 border-2 border-dashed border-border-subtle bg-background-subtle/30 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-background-subtle hover:border-consorci-darkBlue/30 transition-all group"
                >
                   <div className="w-10 h-10 rounded-full bg-background-surface flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Plus className="text-text-muted" size={20} />
                   </div>
                   <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em]">Sube pruebas (fotos, vídeos o PDF)</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-background-subtle border-t border-border-subtle flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="subtle"
              className="px-8 !font-black !text-[10px] uppercase tracking-widest !text-text-muted hover:!text-text-primary"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadingFiles}
              loading={submitting || uploadingFiles}
              variant="primary"
              className="px-14 !py-4 font-black !text-[10px] uppercase tracking-[0.25em] shadow-lg shadow-consorci-darkBlue/10"
            >
              {submitting ? tCommon('loading') : t('form.submit')}
            </Button>
          </div>
        </form>
        
        <p className="text-center mt-10 text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-50">
          Qualsevol adjunt serà revisat per l'equip d'administració
        </p>
      </div>
    </DashboardLayout>
  );
}
