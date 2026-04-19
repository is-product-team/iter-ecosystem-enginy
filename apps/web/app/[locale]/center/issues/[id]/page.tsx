'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import issueService, { Issue } from '@/services/issueService';
import Loading from '@/components/Loading';
import { format } from 'date-fns';
import { ca, es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import getApi from '@/services/api';
import { Paperclip, X, Image as ImageIcon, Film, FileText, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function CenterIssueDetailPage() {
  const t = useTranslations('Issues');
  const tCommon = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const locale = params?.locale || 'ca';
  const dateLocale = locale === 'ca' ? ca : es;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadIssue = useCallback(async () => {
    if (!id) return;
    try {
      const data = await issueService.getById(id);
      setIssue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      loadIssue();
    }
  }, [user, id, loadIssue]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [issue?.messages, scrollToBottom]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !id || sending) return;

    setSending(true);
    try {
      let uploadedAttachmentUrls: any[] = [];
      
      // 1. Upload files first if any
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        
        const api = getApi();
        const res = await api.post('/upload/multimedia', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedAttachmentUrls = res.data.files;
      }

      // 2. Send Message
      const msg = await issueService.addMessage(id, { 
        content: newMessage || 'Adjunt multimedia',
        attachments: uploadedAttachmentUrls
      });

      setIssue(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), msg]
      } : null);
      
      setNewMessage('');
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      toast.error(tCommon('error'));
    } finally {
      setSending(false);
      setUploadingFiles(false);
    }
  };

  if (authLoading || loading || !issue) {
    return <Loading fullScreen />;
  }

  const renderAttachments = (attachments: any[]) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {attachments.map((att, idx) => {
          const isImage = att.fileType.startsWith('image/');
          const isPdf = att.fileType === 'application/pdf';
          const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${att.fileUrl}`;
          
          return (
            <div key={idx} className="group relative w-24 h-24 bg-background-subtle border border-border-subtle rounded-lg overflow-hidden flex items-center justify-center">
              {isImage ? (
                <Image 
                  src={fullUrl} 
                  className="w-full h-full object-cover" 
                  alt={att.fileName} 
                  width={96}
                  height={96}
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-1 p-2">
                  {isPdf ? <FileText size={24} className="text-red-500" /> : <Film size={24} className="text-purple-500" />}
                  <span className="text-[8px] font-bold text-center truncate w-full px-1 uppercase">{att.fileName.split('.').pop()}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white rounded-full text-black hover:bg-consorci-darkBlue hover:text-white transition-colors">
                    <ExternalLink size={12} />
                 </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout
      title={t('details')}
      subtitle={issue.title}
    >
      <div className="flex flex-col h-[calc(100vh-200px)] bg-background-surface border border-border-subtle animate-in fade-in duration-500 shadow-sm overflow-hidden">
        {/* Chat Header Info */}
        <div className="p-4 border-b border-border-subtle bg-background-subtle flex justify-between items-center sm:px-8">
          <div className="flex items-center gap-4">
            <span className="table-tag-muted capitalize font-bold">{t(`categories.${issue.category}`)}</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black tracking-widest uppercase text-text-muted">
                {t(`status_${issue.status.toLowerCase()}` as any)}
             </span>
             <div className={`w-2 h-2 rounded-full ${issue.status === 'OPEN' ? 'bg-blue-500' : issue.status === 'RESOLVED' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 sm:p-10 custom-scrollbar bg-background-page/30">
          {issue.messages?.map((msg) => {
            const isMe = msg.senderId === user?.userId;
            const isAdmin = msg.sender?.role.roleName === 'ADMIN';

            if (msg.isSystem) {
              return (
                <div key={msg.messageId} className="flex justify-center my-4">
                  <span className="px-5 py-2 bg-background-subtle border border-border-subtle rounded-full text-[10px] font-black text-text-muted uppercase tracking-[0.2em] shadow-sm">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${isMe ? 'right' : 'left'}-4 duration-300`}>
                <div className={`max-w-[75%] lg:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                      {isMe ? 'Tu' : isAdmin ? t('chat.admin_reply') : msg.sender?.fullName}
                    </span>
                    <span className="text-[9px] font-bold text-text-muted opacity-50 uppercase">
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: dateLocale })}
                    </span>
                  </div>
                  <div className={`p-5 rounded-2xl shadow-sm border ${
                    isMe 
                      ? 'bg-consorci-darkBlue text-white rounded-tr-sm border-consorci-darkBlue/20' 
                      : 'bg-background-surface text-text-primary rounded-tl-sm border-border-subtle'
                  }`}>
                    <p className="text-[14px] leading-relaxed font-medium">{msg.content}</p>
                    
                    {/* Attachments */}
                    {renderAttachments(msg.attachments as any[])}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Files Row */}
        {selectedFiles.length > 0 && (
          <div className="px-6 py-4 bg-background-surface border-t border-border-subtle flex gap-3 animate-in slide-in-from-bottom-2 duration-200">
             {selectedFiles.map((file, idx) => (
               <div key={idx} className="relative w-16 h-16 bg-background-subtle border border-border-subtle rounded-xl flex items-center justify-center overflow-hidden group">
                  {file.type.startsWith('image/') ? (
                    <Image 
                      src={URL.createObjectURL(file)} 
                      className="w-full h-full object-cover" 
                      alt="preview" 
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                       {file.type === 'application/pdf' ? <FileText size={20} className="text-red-500" /> : <Film size={20} className="text-purple-500" />}
                    </div>
                  )}
                  <button 
                    onClick={() => removeFile(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
               </div>
             ))}
          </div>
        )}

        {/* Message Input */}
        <div className="p-6 border-t border-border-subtle bg-background-surface sm:p-8">
          <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-background-subtle border border-border-subtle text-text-muted hover:text-consorci-darkBlue hover:bg-background-surface transition-all rounded-xl mb-0.5"
              title="Adjuntar fitxer"
              disabled={issue.status === 'CLOSED'}
            >
              <Paperclip size={20} />
            </button>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect}
              accept="image/*,video/*,application/pdf"
            />
            
            <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className="w-full px-6 py-4 bg-background-subtle border border-border-subtle text-[14px] font-medium focus:border-consorci-darkBlue outline-none transition-all resize-none min-h-[56px] max-h-[150px] leading-relaxed"
                  disabled={issue.status === 'CLOSED'}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
            </div>
            
            <Button
              type="submit"
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || issue.status === 'CLOSED'}
              loading={sending || uploadingFiles}
              variant="primary"
              className="px-10 h-[56px] font-black !text-[11px] uppercase tracking-[0.2em] shadow-lg mb-0.5"
            >
              {tCommon('send')}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
