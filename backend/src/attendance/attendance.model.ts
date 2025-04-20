// Prisma Attendance model reference (for type safety)
export interface Attendance {
  id: number;
  userId: number;
  scannedAt: Date;
  qrValue: string;
  createdAt: Date;
}
