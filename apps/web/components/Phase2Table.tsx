'use client';

import { useTranslations } from 'next-intl';
import { Enrollment } from '@/services/assignmentService';
import Avatar from '@/components/Avatar';
import DocumentUpload from '@/components/DocumentUpload';
import DataTable, { Column } from '@/components/ui/DataTable';

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

  const columns: Column<Enrollment>[] = [
    {
      header: t('table_info'),
      render: (ins) => (
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
      )
    },
    {
      header: t('docs.pedagogical_agreement'),
      render: (ins) => (
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
      )
    },
    {
      header: t('docs.mobility_authorization'),
      render: (ins) => (
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
      )
    },
    {
      header: t('docs.image_rights'),
      render: (ins) => (
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
      )
    },
    {
      header: tCommon('actions'),
      align: 'right',
      render: (ins) => (
        <button
          onClick={() => onRemoveStudent(ins.student.studentId)}
          className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 transition-all rounded"
          title={tCommon('delete')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )
    }
  ];

  return (
    <DataTable
      data={enrollments}
      columns={columns}
      emptyMessage={t('no_students')}
    />
  );
}
