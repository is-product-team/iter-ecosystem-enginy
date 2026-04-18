'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Button from './ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  const t = useTranslations('Common');
  if (!isOpen) return null;

  const finalConfirmLabel = confirmLabel || t('confirm');
  const finalCancelLabel = cancelLabel || t('cancel');

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-background-surface border border-border-subtle max-w-md w-full overflow-hidden animate-in zoom-in fade-in duration-200 flex flex-col">
        <div className="p-10 text-center">
          <div className={`w-16 h-16 flex items-center justify-center mx-auto mb-6 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-background-subtle text-consorci-darkBlue'}`}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isDestructive ? "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-text-primary mb-3">
            {title}
          </h3>
          <p className="text-sm text-text-secondary font-normal leading-relaxed px-4">
            {message}
          </p>
        </div>

        <div className="bg-background-subtle px-8 py-5 border-t border-border-subtle flex gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            fullWidth
          >
            {finalCancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant={isDestructive ? 'danger' : 'primary'}
            fullWidth
          >
            {finalConfirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
