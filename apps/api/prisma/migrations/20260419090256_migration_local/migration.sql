-- CreateEnum
CREATE TYPE "Modalitat" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Pendent', 'Aprovada', 'Rebutjada');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PROVISIONAL', 'PUBLISHED', 'DATA_ENTRY', 'DATA_SUBMITTED', 'VALIDATED', 'READY_TO_START', 'VACANT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('Present', 'Absència Justificada', 'Absència', 'Retard');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('SATISFACCIO_ALUMNE', 'SATISFACCIO_CENTRE', 'COMPETENCIES_DOCENT', 'AUTOCONSULTA');

-- CreateEnum
CREATE TYPE "QuestionnaireTarget" AS ENUM ('ALUMNE', 'CENTRE', 'DOCENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('TEXT', 'RATING', 'SINGLE_CHOICE', 'MULTI_CHOICE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Enviat', 'Respost', 'Pendent');

-- CreateTable
CREATE TABLE "sectors" (
    "id_sector" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "descripcio" TEXT,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id_sector")
);

-- CreateTable
CREATE TABLE "tallers" (
    "id_workshop" SERIAL NOT NULL,
    "titol" TEXT NOT NULL,
    "descripcio" TEXT NOT NULL DEFAULT '',
    "durada_h" INTEGER NOT NULL,
    "places_maximes" INTEGER NOT NULL DEFAULT 25,
    "modalitat" "Modalitat" NOT NULL,
    "icona" TEXT NOT NULL DEFAULT '🧩',
    "id_sector" INTEGER NOT NULL,
    "dies_execucio" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "tallers_pkey" PRIMARY KEY ("id_workshop")
);

-- CreateTable
CREATE TABLE "centres" (
    "id_center" SERIAL NOT NULL,
    "codi_center" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adreca" TEXT,
    "url_foto" TEXT,
    "telefon_contacte" TEXT,
    "email_contacte" TEXT,

    CONSTRAINT "centres_pkey" PRIMARY KEY ("id_center")
);

-- CreateTable
CREATE TABLE "rols" (
    "id_role" SERIAL NOT NULL,
    "nom_role" TEXT NOT NULL,

    CONSTRAINT "rols_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "usuaris" (
    "id_user" SERIAL NOT NULL,
    "nom_complet" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "url_foto" TEXT,
    "telefon" TEXT,
    "id_role" INTEGER NOT NULL,
    "id_center" INTEGER,
    "sync_token" TEXT,
    "email_notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_notifications_filter" JSONB,

    CONSTRAINT "usuaris_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "professors" (
    "id_teacher" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "contacte" TEXT NOT NULL,
    "id_center" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "professors_pkey" PRIMARY KEY ("id_teacher")
);

-- CreateTable
CREATE TABLE "peticions" (
    "id_request" SERIAL NOT NULL,
    "id_center" INTEGER NOT NULL,
    "id_workshop" INTEGER NOT NULL,
    "alumnes_aprox" INTEGER,
    "comentaris" TEXT,
    "data_request" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estat" "RequestStatus" NOT NULL DEFAULT 'Pendent',
    "modalitat" "Modalitat",
    "prof1_id" INTEGER,
    "prof2_id" INTEGER,

    CONSTRAINT "peticions_pkey" PRIMARY KEY ("id_request")
);

-- CreateTable
CREATE TABLE "assignacions" (
    "id_assignment" SERIAL NOT NULL,
    "id_request" INTEGER,
    "id_center" INTEGER NOT NULL,
    "id_workshop" INTEGER NOT NULL,
    "data_inici" DATE,
    "data_fi" DATE,
    "estat" "AssignmentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "grup" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "assignacions_pkey" PRIMARY KEY ("id_assignment")
);

-- CreateTable
CREATE TABLE "assignacio_professors" (
    "id_assignment" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "assignacio_professors_pkey" PRIMARY KEY ("id_assignment","id_user")
);

-- CreateTable
CREATE TABLE "checklist_assignacio" (
    "id_checklist" SERIAL NOT NULL,
    "id_assignment" INTEGER NOT NULL,
    "pas_nom" TEXT NOT NULL,
    "completat" BOOLEAN NOT NULL DEFAULT false,
    "url_evidencia" TEXT,
    "data_completat" TIMESTAMP(3),

    CONSTRAINT "checklist_assignacio_pkey" PRIMARY KEY ("id_checklist")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id_session" SERIAL NOT NULL,
    "id_assignment" INTEGER NOT NULL,
    "data_session" TIMESTAMP(3) NOT NULL,
    "hora_inici" TEXT,
    "hora_fi" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id_session")
);

-- CreateTable
CREATE TABLE "sessio_professors" (
    "id_session" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "sessio_professors_pkey" PRIMARY KEY ("id_session","id_user")
);

-- CreateTable
CREATE TABLE "alumnes" (
    "id_student" SERIAL NOT NULL,
    "idalu" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "cognoms" TEXT NOT NULL,
    "email" TEXT,
    "curs" TEXT,
    "url_foto" TEXT,
    "dni" TEXT,
    "telefon" TEXT,
    "data_naixement" TIMESTAMP(3),
    "genere" TEXT,
    "contacte_emergencia" TEXT,
    "telefon_emergencia" TEXT,
    "observacions" TEXT,
    "id_center_origin" INTEGER,
    "id_user" INTEGER,

    CONSTRAINT "alumnes_pkey" PRIMARY KEY ("id_student")
);

-- CreateTable
CREATE TABLE "inscripcions" (
    "id_enrollment" SERIAL NOT NULL,
    "id_assignment" INTEGER NOT NULL,
    "id_student" INTEGER NOT NULL,
    "docs_status" JSONB,

    CONSTRAINT "inscripcions_pkey" PRIMARY KEY ("id_enrollment")
);

-- CreateTable
CREATE TABLE "assistencia" (
    "id_attendance" SERIAL NOT NULL,
    "id_enrollment" INTEGER NOT NULL,
    "id_session" INTEGER,
    "numero_sessio" INTEGER NOT NULL,
    "data_sessio" DATE NOT NULL,
    "estat" "AttendanceStatus" NOT NULL DEFAULT 'Present',
    "observacions" TEXT,

    CONSTRAINT "assistencia_pkey" PRIMARY KEY ("id_attendance")
);

-- CreateTable
CREATE TABLE "certificats" (
    "id_student" INTEGER NOT NULL,
    "id_assignment" INTEGER NOT NULL,
    "data_emissio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificats_pkey" PRIMARY KEY ("id_student","id_assignment")
);

-- CreateTable
CREATE TABLE "avaluacions" (
    "id_evaluation_teacher" SERIAL NOT NULL,
    "id_assignment" INTEGER NOT NULL,
    "id_enrollment" INTEGER,
    "percentatge_asistencia" DOUBLE PRECISION,
    "numero_retards" INTEGER,
    "observacions" TEXT,
    "respostes" JSONB,
    "data_enviament" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipus" "EvaluationType",

    CONSTRAINT "avaluacions_pkey" PRIMARY KEY ("id_evaluation_teacher")
);

-- CreateTable
CREATE TABLE "competencies" (
    "id_competencia" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "tipus" TEXT NOT NULL,

    CONSTRAINT "competencies_pkey" PRIMARY KEY ("id_competencia")
);

-- CreateTable
CREATE TABLE "avaluacio_competencial" (
    "id_evaluation_teacher" INTEGER NOT NULL,
    "id_competencia" INTEGER NOT NULL,
    "puntuacio" INTEGER NOT NULL,

    CONSTRAINT "avaluacio_competencial_pkey" PRIMARY KEY ("id_evaluation_teacher","id_competencia")
);

-- CreateTable
CREATE TABLE "fases" (
    "id_phase" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "descripcio" TEXT,
    "data_inici" TIMESTAMP(3) NOT NULL,
    "data_fi" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fases_pkey" PRIMARY KEY ("id_phase")
);

-- CreateTable
CREATE TABLE "calendari_events" (
    "id_event" SERIAL NOT NULL,
    "id_phase" INTEGER NOT NULL,
    "titol" TEXT NOT NULL,
    "descripcio" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "calendari_events_pkey" PRIMARY KEY ("id_event")
);

-- CreateTable
CREATE TABLE "notificacions" (
    "id_notificacio" SERIAL NOT NULL,
    "id_user" INTEGER,
    "id_center" INTEGER,
    "titol" TEXT NOT NULL,
    "missatge" TEXT NOT NULL,
    "data_creacio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "llegida" BOOLEAN NOT NULL DEFAULT false,
    "tipus" TEXT,
    "importancia" TEXT,

    CONSTRAINT "notificacions_pkey" PRIMARY KEY ("id_notificacio")
);

-- CreateTable
CREATE TABLE "incidencies" (
    "id_issue" SERIAL NOT NULL,
    "id_center" INTEGER NOT NULL,
    "descripcio" TEXT NOT NULL,
    "data_creacio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_assignacio" INTEGER,
    "id_sessio" INTEGER,

    CONSTRAINT "incidencies_pkey" PRIMARY KEY ("id_issue")
);

-- CreateTable
CREATE TABLE "questionaris" (
    "id_questionnaire" SERIAL NOT NULL,
    "id_assignment" INTEGER NOT NULL,
    "destinatari" "QuestionnaireTarget" NOT NULL,
    "token" TEXT NOT NULL,
    "completa" BOOLEAN NOT NULL DEFAULT false,
    "data_completat" TIMESTAMP(3),

    CONSTRAINT "questionaris_pkey" PRIMARY KEY ("id_questionnaire")
);

-- CreateTable
CREATE TABLE "models_questionari" (
    "id_model" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "destinatari" "QuestionnaireTarget" NOT NULL,
    "preguntes" JSONB,

    CONSTRAINT "models_questionari_pkey" PRIMARY KEY ("id_model")
);

-- CreateTable
CREATE TABLE "preguntes" (
    "id_question" SERIAL NOT NULL,
    "id_model" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "tipus" "ResponseType" NOT NULL,
    "opcions" JSONB,

    CONSTRAINT "preguntes_pkey" PRIMARY KEY ("id_question")
);

-- CreateTable
CREATE TABLE "respostes_questionari" (
    "id_response" SERIAL NOT NULL,
    "id_questionnaire" INTEGER NOT NULL,
    "id_question" INTEGER NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "respostes_questionari_pkey" PRIMARY KEY ("id_response")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id_log" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "accio" TEXT NOT NULL,
    "detalls" JSONB,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "autoconsultes_alumne" (
    "id_self_consultation" SERIAL NOT NULL,
    "id_enrollment" INTEGER NOT NULL,
    "claredat_taller" INTEGER NOT NULL,
    "qualitat_material" INTEGER NOT NULL,
    "interes_aprenentatge" INTEGER NOT NULL,
    "acompanyament_docent" INTEGER NOT NULL,
    "valoracio_experiencia" INTEGER NOT NULL,
    "valoracio_docent" INTEGER NOT NULL,
    "impacte_vocacional" TEXT NOT NULL,
    "aprenentatges_clau" TEXT,
    "data_creacio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autoconsultes_alumne_pkey" PRIMARY KEY ("id_self_consultation")
);

-- CreateIndex
CREATE UNIQUE INDEX "sectors_nom_key" ON "sectors"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "tallers_titol_modalitat_key" ON "tallers"("titol", "modalitat");

-- CreateIndex
CREATE UNIQUE INDEX "centres_codi_center_key" ON "centres"("codi_center");

-- CreateIndex
CREATE UNIQUE INDEX "rols_nom_role_key" ON "rols"("nom_role");

-- CreateIndex
CREATE UNIQUE INDEX "usuaris_email_key" ON "usuaris"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuaris_sync_token_key" ON "usuaris"("sync_token");

-- CreateIndex
CREATE UNIQUE INDEX "professors_id_user_key" ON "professors"("id_user");

-- CreateIndex
CREATE INDEX "peticions_estat_idx" ON "peticions"("estat");

-- CreateIndex
CREATE UNIQUE INDEX "assignacions_id_request_key" ON "assignacions"("id_request");

-- CreateIndex
CREATE INDEX "assignacions_data_inici_data_fi_idx" ON "assignacions"("data_inici", "data_fi");

-- CreateIndex
CREATE UNIQUE INDEX "alumnes_idalu_key" ON "alumnes"("idalu");

-- CreateIndex
CREATE UNIQUE INDEX "alumnes_email_key" ON "alumnes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "alumnes_dni_key" ON "alumnes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "alumnes_id_user_key" ON "alumnes"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "avaluacions_id_enrollment_key" ON "avaluacions"("id_enrollment");

-- CreateIndex
CREATE UNIQUE INDEX "fases_nom_key" ON "fases"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "questionaris_token_key" ON "questionaris"("token");

-- CreateIndex
CREATE UNIQUE INDEX "autoconsultes_alumne_id_enrollment_key" ON "autoconsultes_alumne"("id_enrollment");

-- AddForeignKey
ALTER TABLE "tallers" ADD CONSTRAINT "tallers_id_sector_fkey" FOREIGN KEY ("id_sector") REFERENCES "sectors"("id_sector") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuaris" ADD CONSTRAINT "usuaris_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "rols"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuaris" ADD CONSTRAINT "usuaris_id_center_fkey" FOREIGN KEY ("id_center") REFERENCES "centres"("id_center") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_id_center_fkey" FOREIGN KEY ("id_center") REFERENCES "centres"("id_center") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuaris"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peticions" ADD CONSTRAINT "peticions_id_center_fkey" FOREIGN KEY ("id_center") REFERENCES "centres"("id_center") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peticions" ADD CONSTRAINT "peticions_id_workshop_fkey" FOREIGN KEY ("id_workshop") REFERENCES "tallers"("id_workshop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peticions" ADD CONSTRAINT "peticions_prof1_id_fkey" FOREIGN KEY ("prof1_id") REFERENCES "professors"("id_teacher") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peticions" ADD CONSTRAINT "peticions_prof2_id_fkey" FOREIGN KEY ("prof2_id") REFERENCES "professors"("id_teacher") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignacions" ADD CONSTRAINT "assignacions_id_request_fkey" FOREIGN KEY ("id_request") REFERENCES "peticions"("id_request") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignacions" ADD CONSTRAINT "assignacions_id_center_fkey" FOREIGN KEY ("id_center") REFERENCES "centres"("id_center") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignacions" ADD CONSTRAINT "assignacions_id_workshop_fkey" FOREIGN KEY ("id_workshop") REFERENCES "tallers"("id_workshop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignacio_professors" ADD CONSTRAINT "assignacio_professors_id_assignment_fkey" FOREIGN KEY ("id_assignment") REFERENCES "assignacions"("id_assignment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignacio_professors" ADD CONSTRAINT "assignacio_professors_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuaris"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_assignacio" ADD CONSTRAINT "checklist_assignacio_id_assignment_fkey" FOREIGN KEY ("id_assignment") REFERENCES "assignacions"("id_assignment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_id_assignment_fkey" FOREIGN KEY ("id_assignment") REFERENCES "assignacions"("id_assignment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessio_professors" ADD CONSTRAINT "sessio_professors_id_session_fkey" FOREIGN KEY ("id_session") REFERENCES "sessions"("id_session") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessio_professors" ADD CONSTRAINT "session_teacher_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuaris"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumnes" ADD CONSTRAINT "alumnes_id_center_origin_fkey" FOREIGN KEY ("id_center_origin") REFERENCES "centres"("id_center") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumnes" ADD CONSTRAINT "alumnes_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuaris"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripcions" ADD CONSTRAINT "inscripcions_id_assignment_fkey" FOREIGN KEY ("id_assignment") REFERENCES "assignacions"("id_assignment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripcions" ADD CONSTRAINT "inscripcions_id_student_fkey" FOREIGN KEY ("id_student") REFERENCES "alumnes"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistencia" ADD CONSTRAINT "assistencia_id_enrollment_fkey" FOREIGN KEY ("id_enrollment") REFERENCES "inscripcions"("id_enrollment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistencia" ADD CONSTRAINT "assistencia_id_session_fkey" FOREIGN KEY ("id_session") REFERENCES "sessions"("id_session") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats" ADD CONSTRAINT "certificats_id_student_fkey" FOREIGN KEY ("id_student") REFERENCES "alumnes"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificats" ADD CONSTRAINT "certificats_id_assignment_fkey" FOREIGN KEY ("id_assignment") REFERENCES "assignacions"("id_assignment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaluacions" ADD CONSTRAINT "avaluacions_id_assignment_fkey" FOREIGN KEY ("id_assignment") REFERENCES "assignacions"("id_assignment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaluacions" ADD CONSTRAINT "avaluacions_id_enrollment_fkey" FOREIGN KEY ("id_enrollment") REFERENCES "inscripcions"("id_enrollment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaluacio_competencial" ADD CONSTRAINT "avaluacio_competencial_id_evaluation_teacher_fkey" FOREIGN KEY ("id_evaluation_teacher") REFERENCES "avaluacions"("id_evaluation_teacher") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaluacio_competencial" ADD CONSTRAINT "avaluacio_competencial_id_competencia_fkey" FOREIGN KEY ("id_competencia") REFERENCES "competencies"("id_competencia") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendari_events" ADD CONSTRAINT "calendari_events_id_phase_fkey" FOREIGN KEY ("id_phase") REFERENCES "fases"("id_phase") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencies" ADD CONSTRAINT "incidencies_id_center_fkey" FOREIGN KEY ("id_center") REFERENCES "centres"("id_center") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencies" ADD CONSTRAINT "incidencies_id_assignacio_fkey" FOREIGN KEY ("id_assignacio") REFERENCES "assignacions"("id_assignment") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencies" ADD CONSTRAINT "incidencies_id_sessio_fkey" FOREIGN KEY ("id_sessio") REFERENCES "sessions"("id_session") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionaris" ADD CONSTRAINT "questionaris_id_assignment_fkey" FOREIGN KEY ("id_assignment") REFERENCES "assignacions"("id_assignment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preguntes" ADD CONSTRAINT "preguntes_id_model_fkey" FOREIGN KEY ("id_model") REFERENCES "models_questionari"("id_model") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostes_questionari" ADD CONSTRAINT "respostes_questionari_id_questionnaire_fkey" FOREIGN KEY ("id_questionnaire") REFERENCES "questionaris"("id_questionnaire") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuaris"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autoconsultes_alumne" ADD CONSTRAINT "autoconsultes_alumne_id_enrollment_fkey" FOREIGN KEY ("id_enrollment") REFERENCES "inscripcions"("id_enrollment") ON DELETE CASCADE ON UPDATE CASCADE;
