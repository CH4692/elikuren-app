-- CreateEnum
CREATE TYPE "AccessAuditAction" AS ENUM (
  'request_created',
  'approved',
  'rejected',
  'disabled',
  'enabled',
  'magic_link_denied',
  'magic_link_sent'
);

-- AlterTable users
ALTER TABLE "users" ADD COLUMN "voice" TEXT;
ALTER TABLE "users" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable membership_requests
ALTER TABLE "membership_requests" ADD COLUMN "admin_note" TEXT;
ALTER TABLE "membership_requests" ADD COLUMN "approved_at" TIMESTAMP(3);
ALTER TABLE "membership_requests" ADD COLUMN "approved_by_id" TEXT;
ALTER TABLE "membership_requests" ADD COLUMN "rejected_at" TIMESTAMP(3);
ALTER TABLE "membership_requests" ADD COLUMN "rejected_by_id" TEXT;

-- Migrate existing review fields into approved/rejected columns
UPDATE "membership_requests"
SET
  "approved_at" = "reviewed_at",
  "approved_by_id" = "reviewed_by_id"
WHERE "status" = 'approved';

UPDATE "membership_requests"
SET
  "rejected_at" = "reviewed_at",
  "rejected_by_id" = "reviewed_by_id"
WHERE "status" = 'rejected';

-- Drop old review FK/columns
ALTER TABLE "membership_requests" DROP CONSTRAINT IF EXISTS "membership_requests_reviewed_by_id_fkey";
ALTER TABLE "membership_requests" DROP COLUMN IF EXISTS "reviewed_at";
ALTER TABLE "membership_requests" DROP COLUMN IF EXISTS "reviewed_by_id";

-- Add FKs for approved/rejected
ALTER TABLE "membership_requests"
  ADD CONSTRAINT "membership_requests_approved_by_id_fkey"
  FOREIGN KEY ("approved_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "membership_requests"
  ADD CONSTRAINT "membership_requests_rejected_by_id_fkey"
  FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable access_audit_logs
CREATE TABLE "access_audit_logs" (
  "id" TEXT NOT NULL,
  "action" "AccessAuditAction" NOT NULL,
  "actor_user_id" TEXT,
  "target_email" TEXT NOT NULL,
  "request_id" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "access_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "access_audit_logs_target_email_idx" ON "access_audit_logs"("target_email");
CREATE INDEX "access_audit_logs_action_idx" ON "access_audit_logs"("action");
CREATE INDEX "access_audit_logs_created_at_idx" ON "access_audit_logs"("created_at");
