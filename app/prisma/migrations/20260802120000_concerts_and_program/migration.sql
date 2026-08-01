-- Concert programs (setlists) + optional link from audio recordings to concerts.

CREATE TABLE "concerts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concerts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "concerts_slug_key" ON "concerts"("slug");
CREATE INDEX "concerts_is_current_idx" ON "concerts"("is_current");
CREATE INDEX "concerts_date_idx" ON "concerts"("date");
CREATE INDEX "concerts_is_visible_idx" ON "concerts"("is_visible");

ALTER TABLE "audio_files" ADD COLUMN "concert_id" TEXT;
CREATE INDEX "audio_files_concert_id_idx" ON "audio_files"("concert_id");
ALTER TABLE "audio_files" ADD CONSTRAINT "audio_files_concert_id_fkey" FOREIGN KEY ("concert_id") REFERENCES "concerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "concert_items" (
    "id" TEXT NOT NULL,
    "concert_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "ensemble" "VoiceGroup",
    "sheet_file_id" TEXT,
    "audio_file_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concert_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "concert_items_concert_id_sort_order_idx" ON "concert_items"("concert_id", "sort_order");
CREATE INDEX "concert_items_sheet_file_id_idx" ON "concert_items"("sheet_file_id");
CREATE INDEX "concert_items_audio_file_id_idx" ON "concert_items"("audio_file_id");
CREATE INDEX "concert_items_ensemble_idx" ON "concert_items"("ensemble");

ALTER TABLE "concert_items" ADD CONSTRAINT "concert_items_concert_id_fkey" FOREIGN KEY ("concert_id") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "concert_items" ADD CONSTRAINT "concert_items_sheet_file_id_fkey" FOREIGN KEY ("sheet_file_id") REFERENCES "sheet_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "concert_items" ADD CONSTRAINT "concert_items_audio_file_id_fkey" FOREIGN KEY ("audio_file_id") REFERENCES "audio_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
