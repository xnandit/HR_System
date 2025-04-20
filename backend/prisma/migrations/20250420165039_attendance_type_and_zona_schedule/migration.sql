/*
  Warnings:

  - You are about to drop the column `qrValue` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `scannedAt` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `type` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zonaId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('checkin', 'checkout', 'late');

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "qrValue",
DROP COLUMN "scannedAt",
ADD COLUMN     "type" "AttendanceType" NOT NULL,
ADD COLUMN     "zonaId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ZonaSchedule" (
    "id" SERIAL NOT NULL,
    "zonaId" INTEGER NOT NULL,
    "checkinTime" TEXT NOT NULL,
    "checkoutTime" TEXT NOT NULL,
    "toleranceMin" INTEGER NOT NULL,

    CONSTRAINT "ZonaSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZonaSchedule_zonaId_key" ON "ZonaSchedule"("zonaId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZonaSchedule" ADD CONSTRAINT "ZonaSchedule_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
