// Prisma Attendance model reference (for type safety)
export interface Attendance {
  id: number;
  userId: number;
  zonaId: number;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status?: string; // on-time | late
  createdAt: Date;
  updatedAt: Date;
  // zona dan user relasi bisa di-extend jika perlu
}
