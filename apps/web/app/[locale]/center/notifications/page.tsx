'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import notificationService, { Notification } from '@/services/notificationService';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getAll();
      setNotifications(list);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const deleteNotif = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Alert',
      message: 'Are you sure you want to delete this alert? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await notificationService.delete(id);
          setNotifications(prev => prev.filter(n => n.notificationId !== id));
          toast.success("Alert deleted.");
        } catch (_error) {
          toast.error("Error deleting alert.");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const getImportanceStyles = (imp: string) => {
    switch (imp) {
      case 'URGENT': return 'bg-red-50 text-red-700 border-red-200';
      case 'WARNING': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-consorci-darkBlue border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REQUEST':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'PHASE':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  return (
    <DashboardLayout
      title={user?.role.name === 'ADMIN' ? "System Alerts Control" : "Alerts and Notifications"}
      subtitle={user?.role.name === 'ADMIN' ? "Global communication and alert management for all users." : "Stay up to date with phase changes, request resolutions, and official communications."}
    >
      <div className="w-full pb-12">
        {loading ? (
          <Loading message="Loading official alerts..." />
        ) : notifications.length > 0 ? (
          <div className="flex flex-col border border-border-subtle bg-background-subtle/30">
            {notifications.map((notif, _index) => (
              <div
                key={notif.notificationId}
                className={`p-6 border-b border-border-subtle last:border-b-0 transition-colors hover:bg-background-surface relative ${notif.isRead ? 'bg-transparent' : 'bg-background-surface'}`}
              >
                {!notif.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-consorci-darkBlue" />
                )}

                <div className="flex justify-between items-start gap-6">
                  <div className="flex gap-6 flex-1">
                    <div className={`shrink-0 w-12 h-12 flex items-center justify-center border border-border-subtle ${notif.isRead ? 'bg-background-subtle text-text-muted' : 'bg-background-surface text-consorci-darkBlue ring-1 ring-border-subtle'}`}>
                      {getTypeIcon(notif.type || '')}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <span className={`px-2 py-0.5 text-[10px] font-medium border ${getImportanceStyles(notif.importance || '')}`}>
                          {notif.importance}
                        </span>
                        <h3 className={`font-medium tracking-tight leading-tight ${notif.isRead ? 'text-text-muted text-sm' : 'text-text-primary text-[17px]'}`}>
                          {notif.title}
                        </h3>
                      </div>

                      <p className={`text-[14px] font-medium leading-relaxed mb-4 ${notif.isRead ? 'text-text-muted' : 'text-text-secondary'}`}>
                        {notif.message}
                      </p>

                      <div className="text-[12px] font-medium text-text-muted flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                      {!notif.isRead && (
                        <button
                          onClick={() => markRead(notif.notificationId)}
                          className="p-2 bg-background-subtle hover:bg-consorci-darkBlue hover:text-white border border-border-subtle transition-all active:scale-90"
                          title="Mark as read"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(notif.notificationId)}
                        className="p-2 bg-background-subtle hover:bg-red-50 hover:text-red-600 border border-border-subtle transition-all active:scale-90"
                        title="Delete"
                      >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-24 text-center border border-dashed border-border-subtle bg-background-subtle/20">
            <div className="w-16 h-16 bg-background-subtle border border-border-subtle flex items-center justify-center mx-auto mb-8 text-text-muted">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h4 className="text-text-primary font-medium text-[15px] mb-3">No pending alerts</h4>
            <p className="text-text-muted text-[13px] font-medium leading-relaxed max-w-[280px] mx-auto">When there are changes to your requests or key dates, they will appear here.</p>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        isDestructive={confirmConfig.isDestructive}
      />
    </DashboardLayout>
  );
}
