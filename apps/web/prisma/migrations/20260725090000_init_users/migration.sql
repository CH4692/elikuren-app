-- CreateEnum
CREATE TYPE "Role" AS ENUM ('vorstand', 'mitglied', 'kassenwart', 'kassenpruefer');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "street" TEXT,
    "house_number" TEXT,
    "postal_code" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "birthday" DATE,
    "created_at" TIMESTAMP(3) NOT NULL,
    "last_signed_in" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "member_since" DATE,
    "role" "Role" NOT NULL DEFAULT 'mitglied',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_firstname_idx" ON "users"("firstname");

-- CreateIndex
CREATE INDEX "users_lastname_idx" ON "users"("lastname");
