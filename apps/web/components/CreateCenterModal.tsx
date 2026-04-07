"use client";

import React, { useState } from "react";
import centerService, { Center } from "../services/centerService";
import Loading from "./Loading";

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
        setCenterCode(initialData.centerCode);
        setName(initialData.name);
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
      setError("The center code and name are required.");
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
        (initialData ? "Could not update the center." : "Could not create the center.");
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
              {initialData ? "Edit Center" : "Create New Center"}
            </h2>
            <p className="text-[11px] font-normal text-text-muted mt-1">
              {initialData ? "Modify educational center details" : "Enter details to register a new center."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                Center Code <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder="Ex: 08012345"
                value={centerCode}
                onChange={(e) => setCenterCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                Center Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder="Ex: Institut Pedralbes"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                Address
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder="Ex: Carrer Gran Via, 123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                Contact Phone
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder="Ex: 931234567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-primary mb-2">
                Contact Email
              </label>
              <input
                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue text-sm font-medium text-text-primary placeholder:text-text-muted transition-all outline-none"
                placeholder="Ex: contact@centre.edu"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-background-subtle px-8 py-5 border-t border-border-subtle flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[12px] font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            className={`px-8 py-3 text-[12px] font-medium text-white transition-all active:scale-[0.98] ${loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-consorci-darkBlue hover:bg-consorci-actionBlue"
              }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loading size="sm" white message="" />
                Processing...
              </span>
            ) : (
              initialData ? "Save Changes" : "Create Center"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCenterModal;
