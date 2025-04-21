-- Add timeZone column to Zona
ALTER TABLE "Zona" ADD COLUMN     "timeZone" TEXT NOT NULL DEFAULT 'Asia/Jakarta';
