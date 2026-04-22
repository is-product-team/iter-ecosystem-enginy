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
import { Paperclip, X, Image as ImageIcon, Film, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useSocket } from '@/context/SocketContext';

export default function CenterIssueDetailPage() {
  const t = useTranslations('Issues');
  const tCommon = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
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

  // Real-time listeners
  useEffect(() => {
    if (socket && id) {
      // Join the issue room
      socket.emit('join_room', `issue:${id}`);
      console.log(`📡 [SOCKET] Joining room: issue:${id}`);

      const handleNewMessage = (msg: any) => {
        console.log('📡 [SOCKET] New message received:', msg);
        setIssue(prev => {
          if (!prev) return null;
          if (prev.messages?.some(m => m.messageId === msg.messageId)) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), msg]
          };
        });
      };

      const handleStatusUpdate = (data: any) => {
        console.log('📡 [SOCKET] Status updated:', data);
        setIssue(prev => prev ? { ...prev, status: data.status } : null);
      };

      socket.on('issue_message', handleNewMessage);
      socket.on('issue_status_changed', handleStatusUpdate);

      return () => {
        socket.emit('leave_room', `issue:${id}`);
        socket.off('issue_message', handleNewMessage);
        socket.off('issue_status_changed', handleStatusUpdate);
      };
    }
  }, [socket, id]);

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
      <div className="flex flex-wrap gap-2 mt-4">
        {attachments.map((att, idx) => {
          const isImage = att.fileType.startsWith('image/');
          const isPdf = att.fileType === 'application/pdf';
          const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${att.fileUrl}`;
          
          return (
            <div key={idx} className="group relative w-24 h-24 bg-background-page border border-border-subtle rounded-xl overflow-hidden flex items-center justify-center transition-all hover:shadow-md">
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
                  {isPdf ? <FileText size={20} className="text-red-500/70" /> : <Film size={20} className="text-purple-500/70" />}
                  <span className="text-[9px] font-medium text-center truncate w-full px-1 uppercase text-text-muted">{att.fileName.split('.').pop()}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/90 shadow-sm rounded-full text-text-primary hover:text-consorci-darkBlue transition-colors">
                    <ExternalLink size={14} />
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
      <div className="flex flex-col h-[calc(100vh-200px)] bg-background-surface border border-border-subtle animate-in fade-in duration-700 shadow-sm overflow-hidden rounded-2xl font-sans">
        {/* Chat Header Info */}
        <div className="p-5 border-b border-border-subtle bg-background-subtle/50 flex justify-between items-center sm:px-8">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-background-surface border border-border-subtle rounded-full text-[10px] font-medium text-text-muted uppercase tracking-wider">{t(`categories.${issue.category}`)}</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-medium tracking-widest uppercase text-text-muted opacity-60">
                {t(`status_${issue.status.toLowerCase()}` as any)}
             </span>
             <div className={`w-2 h-2 rounded-full ${issue.status === 'OPEN' ? 'bg-blue-500' : issue.status === 'RESOLVED' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10 sm:p-10 custom-scrollbar bg-background-page/30">
          {issue.messages?.map((msg) => {
            const isMe = msg.senderId === user?.userId;
            const isAdmin = msg.sender?.role.roleName === 'ADMIN';

            if (msg.isSystem) {
              return (
                <div key={msg.messageId} className="flex justify-center my-6">
                  <span className="px-5 py-1.5 bg-background-subtle border border-border-subtle rounded-full text-[10px] font-medium text-text-muted/60 uppercase tracking-[0.15em]">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-400`}>
                <div className={`max-w-[80%] lg:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1.5 px-2">
                    <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider opacity-60">
                      {isMe ? 'Tu' : isAdmin ? t('chat.admin_reply') : msg.sender?.fullName}
                    </span>
                    <span className="text-[10px] text-text-muted opacity-40">
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: dateLocale })}
                    </span>
                  </div>
                  <div className={`p-5 rounded-[22px] ${
                    isMe 
                      ? 'bg-consorci-darkBlue text-white rounded-tr-md shadow-sm' 
                      : 'bg-background-surface text-text-primary rounded-tl-md border border-border-subtle/50 shadow-sm'
                  }`}>
                    <p className="text-[15px] leading-relaxed font-normal whitespace-pre-wrap">{msg.content}</p>
                    
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
          <div className="px-6 py-4 bg-background-surface border-t border-border-subtle flex gap-4 animate-in slide-in-from-bottom-2 duration-200">
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
                       {file.type === 'application/pdf' ? <FileText size={18} className="text-red-500/60" /> : <Film size={18} className="text-purple-500/60" />}
                    </div>
                  )}
                  <button 
                    onClick={() => removeFile(idx)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
               </div>
             ))}
          </div>
        )}

        {/* Message Input */}
        <div className="p-6 border-t border-border-subtle bg-background-surface sm:px-10 sm:py-8">
          <form onSubmit={handleSendMessage} className="flex gap-4 items-end max-w-5xl mx-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 bg-background-subtle text-text-muted hover:text-consorci-darkBlue hover:bg-background-page transition-all rounded-full mb-1 border border-border-subtle/50"
              title="Adjuntar fitxer"
              disabled={issue.status === 'CLOSED'}
            >
              <Paperclip size={18} />
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
                  className="w-full px-6 py-4 bg-background-subtle border border-border-subtle text-[15px] font-normal focus:border-consorci-darkBlue outline-none transition-all resize-none min-h-[52px] max-h-[160px] leading-relaxed rounded-2xl"
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
              className="px-8 h-[52px] font-medium !text-[11px] uppercase tracking-[0.15em] shadow-md mb-1 rounded-full"
            >
              {tCommon('send')}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
