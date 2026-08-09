-- CreateTable
CREATE TABLE "concert_performances" (
    "id" TEXT NOT NULL,
    "concert_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "location" TEXT,
    "address" TEXT,
    "label" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concert_performances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "concert_performances_concert_id_starts_at_idx" ON "concert_performances"("concert_id", "starts_at");

-- CreateIndex
CREATE INDEX "concert_performances_starts_at_idx" ON "concert_performances"("starts_at");

-- AddForeignKey
ALTER TABLE "concert_performances" ADD CONSTRAINT "concert_performances_concert_id_fkey" FOREIGN KEY ("concert_id") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one performance per existing concert that has a start time
INSERT INTO "concert_performances" (
  "id",
  "concert_id",
  "starts_at",
  "ends_at",
  "location",
  "address",
  "label",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  'perf_' || c.id,
  c.id,
  c.starts_at,
  c.ends_at,
  c.location,
  c.address,
  NULL,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "concerts" c
WHERE c.starts_at IS NOT NULL;
