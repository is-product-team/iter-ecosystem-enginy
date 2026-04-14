'use client';

import { useTranslations } from 'next-intl';
import { Enrollment } from '@/services/assignmentService';
import Avatar from '@/components/Avatar';
import DocumentUpload from '@/components/DocumentUpload';

interface Phase2TableProps {
  assignmentId: number;
  enrollments: Enrollment[];
  onRemoveStudent: (studentId: number) => void;
  onRefresh: () => void;
}

export default function Phase2Table({
  assignmentId,
  enrollments,
  onRemoveStudent,
  onRefresh
}: Phase2TableProps) {
  const t = useTranslations('AssignmentWorkshopsPage');
  const tCommon = useTranslations('Common');

  return (
    <div className="bg-background-surface border border-border-subtle overflow-hidden">
      <div className="premium-table-container">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background-subtle border-b border-border-subtle">
              <th className="px-8 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('table_info')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('docs.pedagogical_agreement')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('docs.mobility_authorization')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">{t('docs.image_rights')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest text-right">{tCommon('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center">
                  <p className="text-[13px] font-medium text-text-muted italic opacity-60">
                    {t('no_students')}
                  </p>
                </td>
              </tr>
            ) : (
              enrollments.map((ins) => (
                <tr key={ins.enrollmentId} className="hover:bg-background-subtle/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar
                        url={ins.student.photoUrl}
                        name={ins.student.fullName}
                        id={ins.student.studentId}
                        size="sm"
                        type="student"
                      />
                      <div>
                        <p className="text-[14px] font-medium text-text-primary leading-tight mb-1">
                          {ins.student.fullName} {ins.student.lastName}
                        </p>
                        <p className="text-[10px] font-medium text-text-muted">
                          {ins.student.idalu} • {ins.student.grade}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <DocumentUpload
                      assignmentId={assignmentId}
                      enrollmentId={ins.enrollmentId}
                      documentType="pedagogical_agreement"
                      initialUrl={ins.pedagogicalAgreementUrl}
                      isValidated={ins.isPedagogicalAgreementValidated}
                      label={t('docs.pedagogical_agreement')}
                      onUploadSuccess={onRefresh}
                      variant="table"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <DocumentUpload
                      assignmentId={assignmentId}
                      enrollmentId={ins.enrollmentId}
                      documentType="mobility_authorization"
                      initialUrl={ins.mobilityAuthorizationUrl}
                      isValidated={ins.isMobilityAuthorizationValidated}
                      label={t('docs.mobility_authorization')}
                      onUploadSuccess={onRefresh}
                      variant="table"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <DocumentUpload
                      assignmentId={assignmentId}
                      enrollmentId={ins.enrollmentId}
                      documentType="image_rights"
                      initialUrl={ins.imageRightsUrl}
                      isValidated={ins.isImageRightsValidated}
                      label={t('docs.image_rights')}
                      onUploadSuccess={onRefresh}
                      variant="table"
                    />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => onRemoveStudent(ins.student.studentId)}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 transition-all rounded"
                      title={tCommon('delete')}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
