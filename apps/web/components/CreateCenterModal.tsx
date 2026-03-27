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
  const [codiCenter, setCodiCenter] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneContact, setPhoneContact] = useState("");
  const [emailContact, setEmailContact] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (initialData) {
        setCodiCenter(initialData.centerCode);
        setName(initialData.name);
        setAddress(initialData.address || "");
        setPhoneContact(initialData.phone || "");
        setEmailContact(initialData.email || "");
      } else {
        // Reset form
        setCodiCenter("");
        setName("");
        setAddress("");
        setPhoneContact("");
        setEmailContact("");
      }
      setError(null);
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    if (!codiCenter || !name) {
      setError("The center code and name are required.");
      return;
    }
    setLoading(true);
    setError(null);

    const centerData: Omit<Center, "centerId"> = {
      centerCode: codiCenter,
      name: name,
      address: address,
      phone: phoneContact,
      email: emailContact,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-[#00426B] uppercase tracking-tight">
              {initialData ? "Edit Center" : "Create New Center"}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {initialData ? "Modify educational center details" : "Enter details to register a new center."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-[#00426B] transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
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
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Center Code <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: 08012345"
                value={codiCenter}
                onChange={(e) => setCodiCenter(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Center Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: Institut Pedralbes"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Address
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: Carrer Gran Via, 123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Contact Phone
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: 931234567"
                value={phoneContact}
                onChange={(e) => setPhoneContact(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#00426B] uppercase tracking-widest mb-2">
                Contact Email
              </label>
              <input
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 focus:border-[#0775AB] focus:ring-1 focus:ring-[#0775AB] text-sm font-bold text-[#00426B] placeholder:text-gray-300 transition-all outline-none"
                placeholder="Ex: contact@centre.edu"
                value={emailContact}
                onChange={(e) => setEmailContact(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#00426B] hover:bg-[#0775AB]"
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
