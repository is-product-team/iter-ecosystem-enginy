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
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from '@iter/shared';
import Button from '@/components/ui/Button';

export default function AdminIssueDetailPage() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || sending) return;

    setSending(true);
    try {
      const msg = await issueService.addMessage(id, { content: newMessage });
      setIssue(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), msg]
      } : null);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    try {
       await issueService.updateStatus(id, status);
       loadIssue(); // Refresh to get the system message
    } catch (err) {
       console.error(err);
    }
  };

  const handleUpdatePriority = async (priority: string) => {
    if (!id) return;
    try {
       await issueService.updatePriority(id, priority);
       loadIssue(); // Refresh to get the system message
    } catch (err) {
       console.error(err);
    }
  };

  if (authLoading || loading || !issue) {
    return <Loading fullScreen />;
  }

  return (
    <DashboardLayout
      title={t('details')}
      subtitle={issue.title}
    >
      <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] gap-6 animate-in fade-in duration-500">
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background-surface border border-border-subtle">
           {/* Chat Header Info Mobile */}
           <div className="p-4 border-b border-border-subtle bg-background-subtle flex justify-between items-center sm:px-8 lg:hidden">
              <span className="table-tag-muted capitalize">{t(`categories.${issue.category}`)}</span>
              <span className="text-[10px] font-bold text-consorci-darkBlue uppercase">{issue.center?.name}</span>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-6 sm:p-10 custom-scrollbar">
            {issue.messages?.map((msg) => {
              const isMe = msg.senderId === user?.userId;
              
              if (msg.isSystem) {
                return (
                  <div key={msg.messageId} className="flex justify-center my-4">
                    <span className="px-4 py-1.5 bg-background-subtle border border-border-subtle rounded-full text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-text-muted uppercase">
                        {isMe ? 'Administració' : msg.sender?.fullName}
                      </span>
                      <span className="text-[9px] text-text-muted">
                        {format(new Date(msg.createdAt), 'HH:mm', { locale: dateLocale })}
                      </span>
                    </div>
                    <div className={`p-4 text-sm leading-relaxed ${
                      isMe 
                        ? 'bg-consorci-darkBlue text-white rounded-l-2xl rounded-tr-lg shadow-sm border border-consorci-darkBlue/20' 
                        : 'bg-background-subtle text-text-primary rounded-r-2xl rounded-tl-lg border border-border-subtle shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-border-subtle bg-background-surface">
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-6 py-4 bg-background-subtle border border-border-subtle text-sm font-medium focus:border-consorci-darkBlue outline-none transition-all"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                loading={sending}
                variant="primary"
                className="px-8 !py-4 font-bold !text-[11px] uppercase tracking-widest"
              >
                {tCommon('send')}
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 space-y-6">
           {/* Center Card */}
           <div className="bg-background-surface border border-border-subtle p-6">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">{t('table.center')}</h4>
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-text-primary">{issue.center?.name}</span>
                 <span className="text-xs text-text-muted">{issue.creator?.fullName}</span>
              </div>
           </div>

           {/* Controls Card */}
           <div className="bg-background-surface border border-border-subtle p-6 space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">{t('table.status')}</label>
                 <select 
                   value={issue.status}
                   onChange={(e) => handleUpdateStatus(e.target.value)}
                   className="w-full p-3 bg-background-subtle border border-border-subtle text-[11px] font-bold uppercase tracking-widest outline-none focus:border-consorci-darkBlue"
                 >
                    {Object.values(ISSUE_STATUSES).map(s => (
                       <option key={s} value={s}>{t(`status_${s.toLowerCase()}` as any)}</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">{t('table.priority')}</label>
                 <div className="grid grid-cols-2 gap-2">
                    {Object.values(ISSUE_PRIORITIES).map(p => (
                       <Button
                         key={p}
                         onClick={() => handleUpdatePriority(p)}
                         variant={issue.priority === p ? 'primary' : 'outline'}
                         size="sm"
                         className="!py-2 !text-[9px] font-bold uppercase tracking-widest"
                       >
                          {p}
                       </Button>
                    ))}
                 </div>
              </div>

              <div className="pt-4 border-t border-border-subtle">
                 <div className="text-[9px] text-text-muted uppercase tracking-wider">
                    {t('table.date')}: {format(new Date(issue.createdAt), 'PPp', { locale: dateLocale })}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
