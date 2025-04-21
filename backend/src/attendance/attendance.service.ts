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

    // 3. Gunakan waktu lokal zona
    const timeZone = zona.timeZone || 'Asia/Jakarta';
    const now = new Date();
    const todayZoned = toZonedTime(now, timeZone);
    function localToUtc(date: Date) {
      return fromZonedTime(date, timeZone);
    }
    const dateOnly = localToUtc(new Date(todayZoned.getFullYear(), todayZoned.getMonth(), todayZoned.getDate(), 0, 0, 0, 0));
    const zonedNow = fromZonedTime(todayZoned, timeZone);

    // 4. Cari row attendance hari ini
    let attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        zonaId: zona.id,
        date: dateOnly,
      },
    });

    if (type === 'checkin') {
      if (attendance && attendance.checkIn) {
        throw new ForbiddenException('Sudah melakukan checkin hari ini di zona ini');
      }
      // Hitung status: on-time/late
      let status: string | undefined = undefined;
      if (zona.schedules && zona.schedules.length > 0 && zona.schedules[0].checkinTime) {
        const schedule = zona.schedules[0];
        const [jamMasuk, menitMasuk] = schedule.checkinTime.split(":").map(Number);
        const toleransi = Number(schedule.toleranceMin || 0);
        const jadwalMasukDate = new Date(todayZoned);
        jadwalMasukDate.setHours(jamMasuk, menitMasuk + toleransi, 0, 0);
        if (todayZoned > jadwalMasukDate) {
          status = 'late';
        } else {
          status = 'on-time';
        }
      }
      if (!attendance) {
        // Belum ada row, create baru
        attendance = await this.prisma.attendance.create({
          data: {
            userId,
            zonaId: zona.id,
            date: dateOnly,
            checkIn: zonedNow,
            status,
          },
          include: { zona: { select: { name: true, company: { select: { name: true } } } } },
        });
      } else {
        // Row sudah ada tapi belum checkin
        attendance = await this.prisma.attendance.update({
          where: { id: attendance.id },
          data: { checkIn: zonedNow, status },
          include: { zona: { select: { name: true, company: { select: { name: true } } } } },
        });
      }
      return attendance;
    } else if (type === 'checkout') {
      if (!attendance || !attendance.checkIn) {
        throw new ForbiddenException('Belum melakukan checkin hari ini di zona ini');
      }
      if (attendance.checkOut) {
        throw new ForbiddenException('Sudah melakukan checkout hari ini di zona ini');
      }
      attendance = await this.prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkOut: zonedNow },
        include: { zona: { select: { name: true, company: { select: { name: true } } } } },
      });
      return attendance;
    }
    throw new BadRequestException('Invalid attendance type');
  }

  async getAttendanceByUser(userId: number, date?: Date) {
    const where: any = { userId };
    if (date) {
      where.date = date;
    }
    return this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { zona: { select: { name: true, company: { select: { name: true } } } } },
    });
  }
}
