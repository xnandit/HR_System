import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async createAttendance(userId: number, qrValue: string, type: 'checkin' | 'checkout') {
    // 1. Parse qrValue (should be JSON string)
    let qrPayload: any;
    try {
      qrPayload = JSON.parse(qrValue);
    } catch {
      throw new BadRequestException('Invalid QR value format');
    }
    if (!qrPayload.zonaId || !qrPayload.companyId) {
      throw new BadRequestException('QR code missing zonaId or companyId');
    }

    // 2. Validate zona & company
    const zona = await this.prisma.zona.findUnique({
      where: { id: qrPayload.zonaId },
      include: { schedules: true, company: true },
    });
    if (!zona || zona.company.id !== qrPayload.companyId) {
      throw new NotFoundException('Zona or company not found/invalid');
    }

    // 3. Cek apakah user sudah absen hari ini di zona ini (type yang sama)
    // Gunakan waktu lokal zona
    const timeZone = zona.timeZone || 'Asia/Jakarta';
    const now = new Date();
    // Konversi UTC ke waktu lokal zona
    const todayZoned = toZonedTime(now, timeZone);
    // Konversi waktu lokal zona ke UTC
    function localToUtc(date: Date) {
      return fromZonedTime(date, timeZone);
    }
    const start = localToUtc(new Date(todayZoned.getFullYear(), todayZoned.getMonth(), todayZoned.getDate(), 0, 0, 0, 0));
    const end = localToUtc(new Date(todayZoned.getFullYear(), todayZoned.getMonth(), todayZoned.getDate(), 23, 59, 59, 999));
    const zonedNow = fromZonedTime(todayZoned, timeZone);
    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        zonaId: zona.id,
        type,
        createdAt: { gte: start, lte: end },
      },
    });
    if (existing) {
      throw new ForbiddenException(`Sudah melakukan ${type} hari ini di zona ini`);
    }

    // 4. Logic checkin/late
    let attendanceType: 'checkin' | 'late' | 'checkout' = type;
    if (type === 'checkin') {
      const schedule = zona.schedules[0];
      if (schedule) {
        // Parse schedule.checkinTime (HH:mm)
        const [h, m] = schedule.checkinTime.split(':').map(Number);
        const checkinTime = new Date(todayZoned.getFullYear(), todayZoned.getMonth(), todayZoned.getDate(), h, m, 0, 0);
        const toleranceMs = schedule.toleranceMin * 60 * 1000;
        if (now.getTime() > checkinTime.getTime() + toleranceMs) {
          attendanceType = 'late';
        }
      }
    }

    // 5. Simpan attendance dengan waktu sesuai zona
    return this.prisma.attendance.create({
      data: {
        userId,
        zonaId: zona.id,
        type: attendanceType,
        createdAt: zonedNow,
      },
      include: { zona: { select: { name: true, company: { select: { name: true } } } } },
    });
  }

  async getAttendanceByUser(userId: number, date?: Date) {
    const where: any = { userId };
    if (date) {
      where.createdAt = {
        gte: new Date(date.setHours(0,0,0,0)),
        lt: new Date(date.setHours(23,59,59,999)),
      };
    }
    return this.prisma.attendance.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { zona: { select: { name: true, company: { select: { name: true } } } } },
    });
  }
}
