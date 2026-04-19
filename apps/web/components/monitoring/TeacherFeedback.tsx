'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface Response {
  question: string;
  type: string;
  value: string;
}

interface TeacherFeedbackProps {
  responses: Response[];
}

export const TeacherFeedback: React.FC<TeacherFeedbackProps> = ({ responses }) => {
  const t = useTranslations('Center.Monitoring.Feedback');

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-blue-600 fill-blue-600' : 'text-gray-200 fill-gray-200'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const ratings = responses.filter(r => r.type === 'RATING');
  const comments = responses.filter(r => r.type === 'TEXT');

  return (
    <div className="bg-white p-8 border border-neutral-200 shadow-sm">
      <div className="mb-8 border-b border-neutral-100 pb-4">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{t('title')}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-10">
        {ratings.map((r, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <span className="text-xs font-bold text-gray-600">{r.question}</span>
            {renderStars(parseInt(r.value))}
          </div>
        ))}
      </div>

      {comments.length > 0 && (
        <div className="bg-neutral-50 p-6 border-l-4 border-blue-600">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{t('comments_label')}</h5>
          {comments.map((c, i) => (
            <p key={i} className="text-sm text-gray-800 leading-relaxed italic">
              &quot;{c.value}&quot;
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
