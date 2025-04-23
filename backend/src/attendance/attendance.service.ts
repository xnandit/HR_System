import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { calculateWorkHour } from '../utils/workhour';

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
      // Cari semua attendance pada hari tsb (00:00:00 - 23:59:59)
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }
    const attendances = await this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { zona: { select: { name: true, company: { select: { name: true } } } } },
    });
    // Tambahkan field type dan workHour seperti getEmployeeHistory
    return attendances.map(att => {
      let workHour = null;
      if (att.checkIn && att.checkOut) {
        workHour = calculateWorkHour(att.checkIn, att.checkOut);
      }
      return {
        ...att,
        type: att.checkOut ? 'checkout' : (att.status === 'late' ? 'late' : 'checkin'),
        workHour,
      };
    });
  }

  async getSummary(user: any, startDate?: string, endDate?: string, userId?: string) {
    const where: any = {};
    if (startDate && endDate) {
      // Ambil semua zona yang relevan untuk user ini
      let zonaSchedules = [];
      if (user.role === 'admin') {
        zonaSchedules = await this.prisma.zonaSchedule.findMany({
          where: { zona: { companyId: user.companyId } },
          select: { timezone: true, zonaId: true }
        });
      } else {
        // Ambil zona yang pernah dihadiri user
        zonaSchedules = await this.prisma.zonaSchedule.findMany({
          where: { zona: { attendances: { some: { userId: user.id } } } },
          select: { timezone: true, zonaId: true }
        });
      }
      // Buat filter OR berdasarkan timezone masing-masing zona
      const dateFilters = zonaSchedules.map(zs => {
        const offset = zs.timezone ?? 7;
        const start = new Date(`${startDate}T00:00:00+${offset.toString().padStart(2, '0')}:00`);
        const end = new Date(`${endDate}T23:59:59.999+${offset.toString().padStart(2, '0')}:00`);
        return { zonaId: zs.zonaId, date: { gte: start, lte: end } };
      });
      if (dateFilters.length > 0) {
        where.OR = dateFilters;
      }
    }
    if (user.role === 'admin') {
      where.companyId = user.companyId;
      if (userId) where.userId = Number(userId);
    } else {
      where.userId = user.id;
    }
    const [onTime, late] = await Promise.all([
      this.prisma.attendance.count({ where: { ...where, status: 'on-time' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'late' } })
    ]);
    // Absent: user yang tidak punya attendance pada tanggal tsb, bisa dihandle di frontend atau logic khusus
    return { onTime, late, absent: 0 };
  }

  async getEmployeeHistory(user: any, startDate?: string, endDate?: string, userId?: string) {
    const where: any = {};
    if (startDate && endDate) {
      // Ambil semua zona yang relevan untuk user ini
      let zonaSchedules = [];
      if (user.role === 'admin') {
        zonaSchedules = await this.prisma.zonaSchedule.findMany({
          where: { zona: { companyId: user.companyId } },
          select: { timezone: true, zonaId: true }
        });
      } else {
        // Ambil zona yang pernah dihadiri user
        zonaSchedules = await this.prisma.zonaSchedule.findMany({
          where: { zona: { attendances: { some: { userId: user.id } } } },
          select: { timezone: true, zonaId: true }
        });
      }
      // Buat filter OR berdasarkan timezone masing-masing zona
      const dateFilters = zonaSchedules.map(zs => {
        const offset = zs.timezone ?? 7;
        const start = new Date(`${startDate}T00:00:00+${offset.toString().padStart(2, '0')}:00`);
        const end = new Date(`${endDate}T23:59:59.999+${offset.toString().padStart(2, '0')}:00`);
        return { zonaId: zs.zonaId, date: { gte: start, lte: end } };
      });
      if (dateFilters.length > 0) {
        where.OR = dateFilters;
      }
    }
    if (user.role === 'admin') {
      where.companyId = user.companyId;
      if (userId) where.userId = Number(userId);
    } else {
      where.userId = user.id;
    }
    const attendances = await this.prisma.attendance.findMany({
      where,
      include: { user: { select: { name: true, email: true, role: true } }, zona: { select: { id: true, name: true, companyId: true, schedules: true } } },
      orderBy: { date: 'desc' }
    });
    // Tambahkan perhitungan jam kerja (workHour) di backend
    return attendances.map((att) => {
      let workHour = null;
      if (att.checkIn && att.checkOut) {
        workHour = calculateWorkHour(att.checkIn, att.checkOut);
      }
      return {
        ...att,
        workHour,
      };
    });
  }
}
