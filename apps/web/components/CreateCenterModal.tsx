"use client";

import React, { useState } from "react";
import centerService, { Center } from "../services/centerService";
import Button from "./ui/Button";
import { useTranslations } from "next-intl";

type CreateCenterModalProps = {
  visible: boolean;
  onClose: () => void;
  onCenterSaved: (savedCenter: Center) => void;
  initialData?: Center | null;
};

const CreateCenterModal = ({
  visible,
  onClose,
  onCenterSaved,
  initialData,
}: CreateCenterModalProps) => {
  const t = useTranslations('Forms.Centers');
  const tCommon = useTranslations('Common');

  const [centerCode, setCenterCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (initialData) {
        setCenterCode(initialData.centerCode || "");
        setName(initialData.name || "");
        setAddress(initialData.address || "");
        setContactPhone(initialData.contactPhone || "");
        setContactEmail(initialData.contactEmail || "");
      } else {
        // Reset form
        setCenterCode("");
        setName("");
        setAddress("");
        setContactPhone("");
        setContactEmail("");
      }
      setError(null);
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    if (!centerCode || !name) {
      setError(t('required_error'));
      return;
    }
    setLoading(true);
    setError(null);

    const centerData: Omit<Center, "centerId"> = {
      centerCode: centerCode,
      name: name,
      address: address,
      contactPhone: contactPhone,
      contactEmail: contactEmail,
    };

    try {
      let result;
      if (initialData) {
        result = await centerService.update(initialData.centerId, centerData);
      } else {
        result = await centerService.create(centerData);
      }
      onCenterSaved(result);
      onClose();
    } catch (err) {
      const errorMessage = (err as Error).message ||
        (initialData ? t('update_error') : t('create_error'));
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-background-surface border border-border-subtle w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-background-subtle px-8 py-5 border-b border-border-subtle flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-medium text-text-primary">
              {initialData ? t('edit_title') : t('create_title')}
            </h2>
            <p className="text-[11px] font-normal text-text-muted mt-1">
              {initialData ? t('edit_subtitle') : t('create_subtitle')}
            </p>
          </div>
          <Button
            variant="subtle"
            size="sm"
            onClick={onClose}
            className="!p-2 text-text-muted hover:!text-text-primary"
            aria-label={tCommon('close') || "Close"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-50/50 border border-red-200 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                {t('code')} <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder={t('code_placeholder')}
                value={centerCode}
                onChange={(e) => setCenterCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder={t('name_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                {t('address')}
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder={t('address_placeholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                {t('phone')}
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder={t('phone_placeholder')}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                {t('email')}
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder={t('email_placeholder')}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-background-subtle px-8 py-5 border-t border-border-subtle flex justify-end gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
          >
            {loading ? t('processing') : (initialData ? t('save_changes') : t('create_center'))}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCenterModal;
