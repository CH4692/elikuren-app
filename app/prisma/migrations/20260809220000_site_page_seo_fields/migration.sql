-- AlterTable
ALTER TABLE "site_pages" ADD COLUMN "description" TEXT,
ADD COLUMN "meta_title" TEXT,
ADD COLUMN "meta_description" TEXT,
ADD COLUMN "og_image_id" TEXT;

-- CreateIndex
CREATE INDEX "site_pages_og_image_id_idx" ON "site_pages"("og_image_id");

-- AddForeignKey
ALTER TABLE "site_pages" ADD CONSTRAINT "site_pages_og_image_id_fkey" FOREIGN KEY ("og_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
