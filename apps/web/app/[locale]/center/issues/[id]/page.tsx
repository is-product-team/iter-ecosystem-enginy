'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import issueService, { Issue, IssueMessage } from '@/services/issueService';
import Loading from '@/components/Loading';
import { format } from 'date-fns';
import { ca, es } from 'date-fns/locale';

export default function CenterIssueDetailPage() {
  const t = useTranslations('Issues');
  const tCommon = useTranslations('Common');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const locale = params?.locale || 'ca';
  const dateLocale = locale === 'ca' ? ca : es;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadIssue = async () => {
    if (!id) return;
    try {
      const data = await issueService.getById(id);
      setIssue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      loadIssue();
    }
  }, [user, id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [issue?.messages]);

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

  if (authLoading || loading || !issue) {
    return <Loading fullScreen />;
  }

  return (
    <DashboardLayout
      title={t('details')}
      subtitle={issue.title}
    >
      <div className="flex flex-col h-[calc(100vh-200px)] bg-background-surface border border-border-subtle animate-in fade-in duration-500">
        {/* Chat Header Info */}
        <div className="p-4 border-b border-border-subtle bg-background-subtle flex justify-between items-center sm:px-8">
          <div className="flex items-center gap-4">
            <span className="table-tag-muted capitalize">{t(`categories.${issue.category}`)}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              issue.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-background-surface border-border-subtle'
            }`}>
              {issue.priority}
            </span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">
                {t(`status_${issue.status.toLowerCase()}` as any)}
             </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 sm:p-10 custom-scrollbar">
          {issue.messages?.map((msg, idx) => {
            const isMe = msg.senderId === user?.userId;
            const isAdmin = msg.sender?.role.roleName === 'ADMIN';

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
                      {isMe ? 'Tu' : isAdmin ? t('chat.admin_reply') : msg.sender?.fullName}
                    </span>
                    <span className="text-[9px] text-text-muted">
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: dateLocale })}
                    </span>
                  </div>
                  <div className={`p-4 text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-consorci-darkBlue text-white rounded-l-2xl rounded-tr-lg shadow-sm' 
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
        <div className="p-4 border-t border-border-subtle bg-background-surface sm:p-6 lg:p-8">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-6 py-4 bg-background-subtle border border-border-subtle text-sm font-medium focus:border-consorci-darkBlue outline-none transition-all"
              disabled={issue.status === 'CLOSED'}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || issue.status === 'CLOSED'}
              className="px-8 py-4 bg-consorci-darkBlue text-white font-bold text-[11px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {sending ? '...' : tCommon('send')}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
