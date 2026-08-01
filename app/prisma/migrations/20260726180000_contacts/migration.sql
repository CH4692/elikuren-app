-- CreateEnum
CREATE TYPE "ContactType" AS ENUM (
  'CHOIR_MEMBER',
  'FORMER_MEMBER',
  'MUSICIAN',
  'SOLOIST',
  'ORGANIZER',
  'PARISH',
  'VENDOR',
  'OTHER'
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "type" "ContactType" NOT NULL DEFAULT 'OTHER',
    "firstname" TEXT,
    "lastname" TEXT,
    "email" TEXT,
    "organization" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "linked_user_id" TEXT,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_type_idx" ON "contacts"("type");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_lastname_idx" ON "contacts"("lastname");

-- CreateIndex
CREATE INDEX "contacts_linked_user_id_idx" ON "contacts"("linked_user_id");

-- CreateIndex
CREATE INDEX "contacts_archived_at_idx" ON "contacts"("archived_at");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_linked_user_id_fkey" FOREIGN KEY ("linked_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
