'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface TeacherSatisfactionProps {
  data: {
    teacherAverages: Record<string, number>;
    totalTeacherSubmissions: number;
  };
}

export const TeacherSatisfaction: React.FC<TeacherSatisfactionProps> = ({ data }) => {
  const t = useTranslations('Center.Monitoring.Satisfaction');

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${star <= Math.round(score) ? 'text-blue-600 fill-blue-600' : 'text-gray-200 fill-gray-200'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const metrics = data?.teacherAverages ? Object.entries(data.teacherAverages) : [];

  if (metrics.length === 0) return null;

  return (
    <div className="bg-white border border-neutral-200 mb-12 overflow-hidden shadow-sm">
      <div className="bg-neutral-50 px-8 py-5 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900">{t('title')}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t('description')}</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <span className="block text-lg font-black text-blue-600 leading-none">
                    {data.totalTeacherSubmissions}
                </span>
                <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">
                    {t('responses_count', { count: '' }).replace(':','') }
                </span>
            </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {metrics.map(([label, score]) => (
                <div key={label} className="bg-gray-50/50 p-5 border border-gray-100 rounded-xl flex flex-col justify-between h-28">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-tight">
                        {label}
                    </span>
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">
                                {(score * 20).toFixed(1)}%
                            </span>
                            {renderStars(score)}
                        </div>
                        <div className={`text-[10px] font-black px-2 py-1 rounded bg-white border border-gray-100 ${
                            score >= 4 ? 'text-green-600' : score >= 3 ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                            {score.toFixed(2)}/5
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
