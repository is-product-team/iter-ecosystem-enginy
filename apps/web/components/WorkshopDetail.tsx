"use client";

import React from 'react';
import Image from 'next/image';
import { Workshop } from '../services/workshopService';

const SVG_ICONS: Record<string, React.ReactNode> = {
  PUZZLE: <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />,
  ROBOT: <path d="M12 2a2 2 0 012 2v1h2a2 2 0 012 2v2h1a2 2 0 012 2v4a2 2 0 01-2 2h-1v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2H4a2 2 0 01-2-2v-4a2 2 0 012-2h1V7a2 2 0 012-2h2V4a2 2 0 012-2zM9 9H7v2h2V9zm8 0h-2v2h2V9z" />,
  CODE: <path d="M10 20l-7-7 7-7m4 0l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor" />,
  PAINT: <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10c1 0 1.8-.8 1.8-1.8 0-.46-.17-.9-.47-1.24-.3-.33-.47-.78-.47-1.26 0-.96.79-1.75 1.75-1.75H17c2.76 0 5-2.24 5-5 0-4.42-4.48-8-10-8z" />,
  FILM: <path d="M7 4V20M17 4V20M3 8H7M17 8H21M3 12H21M3 16H7M17 16H21M3 4H21V20H3V4Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor" />,
  TOOLS: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6-3.8 3.8L11 11.6a1 1 0 00-1.4 0L3.3 18a1 1 0 000 1.4l1.3 1.3a1 1 0 001.4 0l6.4-6.4 1.5 1.5a1 1 0 001.4 0l3.8-3.8 1.6 1.6a1 1 0 001.4 0l1.3-1.3a1 1 0 000-1.4L14.7 6.3z" />,
  LEAF: <path d="M12 2a10 10 0 00-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16z" />,
  GEAR: <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" />
};

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedWorkshop: Workshop | null;
  onEdit: (workshop: Workshop) => void;
  onDelete: (id: string) => void;
}

export default function WorkshopDetail({ visible, onClose, selectedWorkshop, onEdit, onDelete }: Props) {
  if (!visible || !selectedWorkshop) return null;

  const imageSource = selectedWorkshop.image 
    || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop";

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this workshop? This action cannot be undone.")) {
      onDelete(selectedWorkshop._id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
        {/* Close Button - Floating */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 z-50 text-white transition-all active:scale-95 border border-white/20"
          title="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Hero Image Section */}
          <div className="md:w-2/5 relative min-h-[300px]">
            <Image
              src={imageSource}
              className="absolute inset-0 w-full h-full object-cover"
              alt={selectedWorkshop.title}
              width={800}
              height={400}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />
            
            {/* Badges on Image (Mobile) or Sidebar */}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
              <span className="bg-white text-consorci-darkBlue px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                {selectedWorkshop.modality}
              </span>
              <span className="bg-consorci-lightBlue text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                {selectedWorkshop.term} Quarter
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-3/5 p-8 md:p-12 flex flex-col">
            <div className="flex justify-between items-start mb-6 gap-4">
              <div className="flex-1">
                <p className="text-consorci-lightBlue font-black text-[10px] uppercase tracking-widest mb-2">Workshop Details</p>
                <h1 className="text-consorci-darkBlue text-4xl font-black leading-none tracking-tight flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 border border-gray-100 shrink-0">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      {SVG_ICONS[selectedWorkshop.icon || "PUZZLE"] || SVG_ICONS.PUZZLE}
                    </svg>
                  </div>
                  {selectedWorkshop.title}
                </h1>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => onEdit(selectedWorkshop)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 transition-all active:scale-95 border border-gray-200"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 transition-all active:scale-95 border border-red-100"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Technical Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="bg-gray-50 p-3 text-consorci-darkBlue border border-gray-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1 block">Location</span>
                  <p className="text-consorci-darkBlue font-bold">{selectedWorkshop.technicalDetails?.defaultLocation ?? 'Not available'}</p>
                </div>
              </div>
 
              <div className="flex items-start gap-4">
                <div className="bg-gray-50 p-3 text-consorci-darkBlue border border-gray-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1 block">Capacity</span>
                  <p className="text-consorci-darkBlue font-bold">{selectedWorkshop.technicalDetails?.maxPlaces ?? 0} Places available</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 border-l-4 border-consorci-darkBlue p-6 mb-8 flex-1">
              <span className="text-consorci-darkBlue font-black text-[10px] uppercase tracking-widest mb-2 block">Workshop Summary</span>
              <p className="text-gray-600 leading-relaxed text-sm">
                {selectedWorkshop.technicalDetails?.description ?? 'No description available for this workshop.'}
              </p>
            </div>

            {/* Referents section if exists */}
            {(selectedWorkshop.assignedReferents?.length ?? 0) > 0 && (
              <div className="mb-10">
                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-3 block">Assigned Referents</span>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkshop.assignedReferents!.map((ref, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-bold border border-gray-200">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button
                onClick={() => console.log('Download PDF')}
                className="flex items-center justify-center px-6 py-3 border border-gray-200 hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-widest text-[#00426B]"
              >
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Technical Sheet (PDF)
              </button>
              <button
                onClick={onClose}
                className="bg-[#00426B] hover:bg-[#0775AB] text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
