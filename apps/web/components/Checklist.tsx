'use client';

import { useState } from 'react';

interface ChecklistItem {
  checklistId: number;
  stepName: string;
  isCompleted: boolean;
  evidenceUrl?: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  onUpdate: (id: number, isCompleted: boolean, url?: string) => Promise<void>;
}

export default function Checklist({ items, onUpdate }: ChecklistProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const handleToggle = async (item: ChecklistItem) => {
    setLoading(item.checklistId);
    try {
      await onUpdate(item.checklistId, !item.isCompleted, item.evidenceUrl);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.checklistId}
          className={`flex items-start gap-4 p-4 border transition ${item.isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
            }`}
        >
          <button
            onClick={() => handleToggle(item)}
            disabled={loading === item.checklistId}
            className={`mt-1 w-6 h-6 flex items-center justify-center border-2 transition rounded-full ${item.isCompleted
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white border-gray-300 hover:border-consorci-lightBlue'
              }`}
          >
            {item.isCompleted && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {loading === item.checklistId && (
              <svg className="animate-spin h-3 w-3 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>

          <div className="flex-1">
            <h4 className={`text-sm font-bold ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {item.stepName}
            </h4>
            {!item.isCompleted && item.stepName.toLowerCase().includes('evidencia') && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Evidence URL (Google Drive, etc.)"
                  className="text-xs w-full p-2 border border-gray-300 focus:border-consorci-lightBlue outline-none"
                  defaultValue={item.evidenceUrl}
                  onBlur={(e) => onUpdate(item.checklistId, item.isCompleted, e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
