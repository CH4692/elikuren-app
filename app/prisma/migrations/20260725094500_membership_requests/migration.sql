-- CreateEnum
CREATE TYPE "MembershipRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "membership_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "message" TEXT,
    "voice" TEXT,
    "status" "MembershipRequestStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" TEXT,

    CONSTRAINT "membership_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membership_requests_email_idx" ON "membership_requests"("email");

-- CreateIndex
CREATE INDEX "membership_requests_status_idx" ON "membership_requests"("status");

-- AddForeignKey
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
