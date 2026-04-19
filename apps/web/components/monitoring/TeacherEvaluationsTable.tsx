'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface Evaluation {
    questionnaireId: number;
    assignmentId: number;
    workshopTitle: string;
    modality: string;
    teacherName: string;
    date: string;
    metrics: Record<string, any>;
}

interface TeacherEvaluationsTableProps {
    evaluations: Evaluation[];
    onViewDetails: (assignmentId: number) => void;
}

export const TeacherEvaluationsTable: React.FC<TeacherEvaluationsTableProps> = ({ evaluations, onViewDetails }) => {
    const t = useTranslations('Center.Monitoring.EvaluationsTable');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const [filter, setFilter] = useState('');

    const filteredEvaluations = evaluations.filter(e => 
        e.workshopTitle.toLowerCase().includes(filter.toLowerCase()) ||
        e.teacherName.toLowerCase().includes(filter.toLowerCase())
    );

    // Extract metric keys from the first evaluation to use as column headers
    const metricKeys = evaluations.length > 0 ? Object.keys(evaluations[0].metrics).filter(k => typeof evaluations[0].metrics[k] === 'number') : [];

    return (
        <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
            {/* Table Header / Toolbar */}
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900">{t('title')}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t('subtitle')}</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-neutral-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Responsive Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-r border-neutral-200 whitespace-nowrap">{t('columns.workshop')}</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-r border-neutral-200 whitespace-nowrap">{t('columns.teacher')}</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-r border-neutral-200 whitespace-nowrap text-center">{t('columns.modality')}</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-r border-neutral-200 whitespace-nowrap">{t('columns.date')}</th>
                            
                            {metricKeys.map(key => (
                                <th key={key} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-r border-neutral-200 text-center min-w-[100px]">
                                    {key.length > 20 ? key.substring(0, 17) + '...' : key}
                                </th>
                            ))}
                            
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap text-right">{tc('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvaluations.length === 0 ? (
                            <tr>
                                <td colSpan={5 + metricKeys.length} className="px-4 py-10 text-center text-xs text-gray-400 italic">
                                    {t('no_results')}
                                </td>
                            </tr>
                        ) : (
                            filteredEvaluations.map((evalItem, idx) => (
                                <tr key={evalItem.questionnaireId} className={`border-b border-neutral-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'}`}>
                                    <td className="px-4 py-3 text-xs font-bold text-blue-900 border-r border-neutral-100">
                                        {evalItem.workshopTitle}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-medium text-gray-600 border-r border-neutral-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-700">
                                                {evalItem.teacherName.charAt(0)}
                                            </div>
                                            {evalItem.teacherName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-black text-center border-r border-neutral-100">
                                        <span className={`px-2 py-0.5 rounded text-[9px] ${
                                            evalItem.modality === 'A' ? 'bg-green-100 text-green-700' : 
                                            evalItem.modality === 'B' ? 'bg-orange-100 text-orange-700' : 
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                            {evalItem.modality}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-medium text-gray-500 border-r border-neutral-100 whitespace-nowrap">
                                        {new Date(evalItem.date).toLocaleDateString(locale)}
                                    </td>

                                    {metricKeys.map(key => {
                                        const score = evalItem.metrics[key];
                                        return (
                                            <td key={key} className="px-4 py-3 text-center border-r border-neutral-100">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black border ${
                                                    score >= 4 ? 'bg-green-50 text-green-700 border-green-100' : 
                                                    score >= 3 ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                    'bg-orange-50 text-orange-700 border-orange-100'
                                                }`}>
                                                    {score}
                                                </div>
                                            </td>
                                        );
                                    })}

                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => onViewDetails(evalItem.assignmentId)}
                                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-900 transition-colors"
                                        >
                                            {t('view_feedback')}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {t('total_count', { count: filteredEvaluations.length })}
                </p>
            </div>
        </div>
    );
};
