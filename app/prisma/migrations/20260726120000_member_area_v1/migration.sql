-- CreateEnum
CREATE TYPE "RehearsalStatus" AS ENUM ('PLANNED', 'REHEARSING', 'PERFORMANCE_READY', 'ARCHIVED');
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "SheetType" AS ENUM ('FULL_SCORE', 'CHOIR_SCORE', 'SOPRANO', 'ALTO', 'TENOR', 'BASS', 'PIANO', 'OTHER');
CREATE TYPE "AudioType" AS ENUM ('FULL_RECORDING', 'SOPRANO', 'ALTO', 'TENOR', 'BASS', 'PIANO', 'REHEARSAL', 'PRONUNCIATION', 'CONCERT_RECORDING', 'OTHER');
CREATE TYPE "VoiceGroup" AS ENUM ('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'OTHER');
CREATE TYPE "FileAccessScope" AS ENUM ('ALL_MEMBERS', 'VOICE_GROUP_ONLY', 'ADMIN_ONLY');
CREATE TYPE "StoredFileCategory" AS ENUM ('SHEET', 'AUDIO', 'INVOICE', 'ANNOUNCEMENT', 'OTHER');
CREATE TYPE "FileVisibility" AS ENUM ('MEMBERS', 'ADMIN');
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED', 'DELETED');
CREATE TYPE "FavoriteTargetType" AS ENUM ('PIECE', 'SHEET', 'AUDIO');
CREATE TYPE "ContentEventType" AS ENUM ('VIEWED', 'PLAYED', 'DOWNLOADED');
CREATE TYPE "EventType" AS ENUM ('REHEARSAL', 'SPECIAL_REHEARSAL', 'GENERAL_REHEARSAL', 'CONCERT', 'SERVICE', 'PERFORMANCE', 'OTHER');
CREATE TYPE "RsvpStatus" AS ENUM ('YES', 'NO', 'MAYBE');
CREATE TYPE "AnnouncementAudience" AS ENUM ('ALL_MEMBERS', 'ROLE', 'VOICE_GROUP');
CREATE TYPE "InvoiceDocumentType" AS ENUM ('INCOME', 'EXPENSE', 'INVOICE', 'RECEIPT', 'CREDIT_NOTE');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'OVERDUE', 'CANCELLED');

-- AlterTable users
ALTER TABLE "users" ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_actor_user_id_fkey"
  FOREIGN KEY ("actor_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate AccessAuditLog → AuditLog (preserve history)
INSERT INTO "audit_logs" ("id", "actor_user_id", "action", "entity_type", "entity_id", "metadata", "created_at")
SELECT
  a."id",
  a."actor_user_id",
  CASE a."action"::text
    WHEN 'request_created' THEN 'access.request_created'
    WHEN 'approved' THEN 'access.approved'
    WHEN 'rejected' THEN 'access.rejected'
    WHEN 'disabled' THEN 'user.disabled'
    WHEN 'enabled' THEN 'user.enabled'
    WHEN 'magic_link_denied' THEN 'access.magic_link_denied'
    WHEN 'magic_link_sent' THEN 'access.magic_link_sent'
    ELSE a."action"::text
  END,
  CASE
    WHEN a."request_id" IS NOT NULL THEN 'membership_request'
    ELSE 'user'
  END,
  a."request_id",
  jsonb_strip_nulls(
    COALESCE(a."metadata", '{}'::jsonb) ||
    jsonb_build_object('targetEmail', a."target_email")
  ),
  a."created_at"
FROM "access_audit_logs" a;

-- Drop old access audit table + enum
DROP TABLE IF EXISTS "access_audit_logs";
DROP TYPE IF EXISTS "AccessAuditAction";

-- StoredFile
CREATE TABLE "stored_files" (
    "id" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "etag" TEXT,
    "category" "StoredFileCategory" NOT NULL,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'MEMBERS',
    "upload_status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "uploaded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "stored_files_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stored_files_object_key_key" ON "stored_files"("object_key");
CREATE INDEX "stored_files_upload_status_idx" ON "stored_files"("upload_status");
CREATE INDEX "stored_files_category_idx" ON "stored_files"("category");
ALTER TABLE "stored_files"
  ADD CONSTRAINT "stored_files_uploaded_by_id_fkey"
  FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- MusicPiece
CREATE TABLE "music_pieces" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "composer" TEXT NOT NULL,
    "arranger" TEXT,
    "category" TEXT,
    "epoch" TEXT,
    "instrumentation" TEXT,
    "difficulty" TEXT,
    "rehearsal_status" "RehearsalStatus" NOT NULL DEFAULT 'PLANNED',
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "rehearsal_notes" TEXT,
    "description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "music_pieces_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "music_pieces_title_idx" ON "music_pieces"("title");
CREATE INDEX "music_pieces_composer_idx" ON "music_pieces"("composer");
CREATE INDEX "music_pieces_publication_status_idx" ON "music_pieces"("publication_status");
CREATE INDEX "music_pieces_rehearsal_status_idx" ON "music_pieces"("rehearsal_status");

-- SheetFile
CREATE TABLE "sheet_files" (
    "id" TEXT NOT NULL,
    "piece_id" TEXT NOT NULL,
    "stored_file_id" TEXT NOT NULL,
    "sheet_type" "SheetType" NOT NULL DEFAULT 'OTHER',
    "voice_group" "VoiceGroup",
    "access_scope" "FileAccessScope" NOT NULL DEFAULT 'ALL_MEMBERS',
    "version" TEXT NOT NULL DEFAULT '1',
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "changelog" TEXT,
    "published_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sheet_files_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sheet_files_piece_id_idx" ON "sheet_files"("piece_id");
CREATE INDEX "sheet_files_voice_group_idx" ON "sheet_files"("voice_group");
ALTER TABLE "sheet_files"
  ADD CONSTRAINT "sheet_files_piece_id_fkey"
  FOREIGN KEY ("piece_id") REFERENCES "music_pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sheet_files"
  ADD CONSTRAINT "sheet_files_stored_file_id_fkey"
  FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AudioFile
CREATE TABLE "audio_files" (
    "id" TEXT NOT NULL,
    "piece_id" TEXT NOT NULL,
    "stored_file_id" TEXT NOT NULL,
    "audio_type" "AudioType" NOT NULL DEFAULT 'OTHER',
    "voice_group" "VoiceGroup",
    "access_scope" "FileAccessScope" NOT NULL DEFAULT 'ALL_MEMBERS',
    "duration_seconds" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "audio_files_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audio_files_piece_id_idx" ON "audio_files"("piece_id");
CREATE INDEX "audio_files_audio_type_idx" ON "audio_files"("audio_type");
ALTER TABLE "audio_files"
  ADD CONSTRAINT "audio_files_piece_id_fkey"
  FOREIGN KEY ("piece_id") REFERENCES "music_pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audio_files"
  ADD CONSTRAINT "audio_files_stored_file_id_fkey"
  FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Favorites / content events
CREATE TABLE "user_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" "FavoriteTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_favorites_user_id_target_type_target_id_key" ON "user_favorites"("user_id", "target_type", "target_id");
CREATE INDEX "user_favorites_user_id_idx" ON "user_favorites"("user_id");
ALTER TABLE "user_favorites"
  ADD CONSTRAINT "user_favorites_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "user_content_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" "ContentEventType" NOT NULL,
    "target_type" "FavoriteTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "last_position_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_content_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "user_content_events_user_id_event_type_idx" ON "user_content_events"("user_id", "event_type");
CREATE INDEX "user_content_events_target_type_target_id_idx" ON "user_content_events"("target_type", "target_id");
ALTER TABLE "user_content_events"
  ADD CONSTRAINT "user_content_events_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Events
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'REHEARSAL',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "location" TEXT,
    "description" TEXT,
    "rsvp_deadline" TIMESTAMP(3),
    "piece_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "events_starts_at_idx" ON "events"("starts_at");
CREATE INDEX "events_type_idx" ON "events"("type");
ALTER TABLE "events"
  ADD CONSTRAINT "events_piece_id_fkey"
  FOREIGN KEY ("piece_id") REFERENCES "music_pieces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "event_responses" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "RsvpStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "event_responses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "event_responses_event_id_user_id_key" ON "event_responses"("event_id", "user_id");
ALTER TABLE "event_responses"
  ADD CONSTRAINT "event_responses_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_responses"
  ADD CONSTRAINT "event_responses_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Announcements
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "announcements_published_at_idx" ON "announcements"("published_at");

CREATE TABLE "announcement_targets" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "audience" "AnnouncementAudience" NOT NULL,
    "role" "Role",
    "voice_group" "VoiceGroup",
    CONSTRAINT "announcement_targets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "announcement_targets_announcement_id_idx" ON "announcement_targets"("announcement_id");
ALTER TABLE "announcement_targets"
  ADD CONSTRAINT "announcement_targets_announcement_id_fkey"
  FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "announcement_reads" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "announcement_reads_announcement_id_user_id_key" ON "announcement_reads"("announcement_id", "user_id");
ALTER TABLE "announcement_reads"
  ADD CONSTRAINT "announcement_reads_announcement_id_fkey"
  FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "announcement_reads"
  ADD CONSTRAINT "announcement_reads_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "announcement_attachments" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "stored_file_id" TEXT NOT NULL,
    CONSTRAINT "announcement_attachments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "announcement_attachments"
  ADD CONSTRAINT "announcement_attachments_announcement_id_fkey"
  FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "announcement_attachments"
  ADD CONSTRAINT "announcement_attachments_stored_file_id_fkey"
  FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invoices
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "document_type" "InvoiceDocumentType" NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_email" TEXT,
    "recipient_address" TEXT,
    "supplier_name" TEXT,
    "description" TEXT,
    "category" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "tax_amount_cents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "issue_date" DATE NOT NULL,
    "due_date" DATE,
    "paid_at" TIMESTAMP(3),
    "payment_method" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "stored_file_id" TEXT,
    "member_id" TEXT,
    "event_id" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
CREATE INDEX "invoices_status_idx" ON "invoices"("status");
CREATE INDEX "invoices_issue_date_idx" ON "invoices"("issue_date");
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");
ALTER TABLE "invoices"
  ADD CONSTRAINT "invoices_stored_file_id_fkey"
  FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices"
  ADD CONSTRAINT "invoices_member_id_fkey"
  FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices"
  ADD CONSTRAINT "invoices_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
