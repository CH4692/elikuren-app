/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MITGLIED', 'VORSTAND');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "geburtstag" TEXT,
ADD COLUMN     "hausnummer" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "nachname" TEXT,
ADD COLUMN     "ort" TEXT,
ADD COLUMN     "postleitzahl" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MITGLIED',
ADD COLUMN     "straße" TEXT,
ADD COLUMN     "telefon" TEXT,
ADD COLUMN     "vorname" TEXT;
