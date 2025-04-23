"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const date_fns_tz_1 = require("date-fns-tz");
const workhour_1 = require("../utils/workhour");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAttendance(userId, qrValue, type) {
        let qrPayload;
        try {
            qrPayload = JSON.parse(qrValue);
        }
        catch {
            throw new common_1.BadRequestException('Invalid QR value format');
        }
        if (!qrPayload.zonaId || !qrPayload.companyId) {
            throw new common_1.BadRequestException('QR code missing zonaId or companyId');
        }
        const zona = await this.prisma.zona.findUnique({
            where: { id: qrPayload.zonaId },
            include: { schedules: true, company: true },
        });
        if (!zona || zona.company.id !== qrPayload.companyId) {
            throw new common_1.NotFoundException('Zona or company not found/invalid');
        }
        const timeZone = zona.timeZone || 'Asia/Jakarta';
        const now = new Date();
        const todayZoned = (0, date_fns_tz_1.toZonedTime)(now, timeZone);
        function localToUtc(date) {
            return (0, date_fns_tz_1.fromZonedTime)(date, timeZone);
        }
        const dateOnly = localToUtc(new Date(todayZoned.getFullYear(), todayZoned.getMonth(), todayZoned.getDate(), 0, 0, 0, 0));
        const zonedNow = (0, date_fns_tz_1.fromZonedTime)(todayZoned, timeZone);
        let attendance = await this.prisma.attendance.findFirst({
            where: {
                userId,
                zonaId: zona.id,
                date: dateOnly,
            },
        });
        if (type === 'checkin') {
            if (attendance && attendance.checkIn) {
                throw new common_1.ForbiddenException('Sudah melakukan checkin hari ini di zona ini');
            }
            let status = undefined;
            if (zona.schedules && zona.schedules.length > 0 && zona.schedules[0].checkinTime) {
                const schedule = zona.schedules[0];
                const [jamMasuk, menitMasuk] = schedule.checkinTime.split(":").map(Number);
                const toleransi = Number(schedule.toleranceMin || 0);
                const jadwalMasukDate = new Date(todayZoned);
                jadwalMasukDate.setHours(jamMasuk, menitMasuk + toleransi, 0, 0);
                if (todayZoned > jadwalMasukDate) {
                    status = 'late';
                }
                else {
                    status = 'on-time';
                }
            }
            if (!attendance) {
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
            }
            else {
                attendance = await this.prisma.attendance.update({
                    where: { id: attendance.id },
                    data: { checkIn: zonedNow, status },
                    include: { zona: { select: { name: true, company: { select: { name: true } } } } },
                });
            }
            return attendance;
        }
        else if (type === 'checkout') {
            if (!attendance || !attendance.checkIn) {
                throw new common_1.ForbiddenException('Belum melakukan checkin hari ini di zona ini');
            }
            if (attendance.checkOut) {
                throw new common_1.ForbiddenException('Sudah melakukan checkout hari ini di zona ini');
            }
            attendance = await this.prisma.attendance.update({
                where: { id: attendance.id },
                data: { checkOut: zonedNow },
                include: { zona: { select: { name: true, company: { select: { name: true } } } } },
            });
            return attendance;
        }
        throw new common_1.BadRequestException('Invalid attendance type');
    }
    async getAttendanceByUser(userId, date) {
        const where = { userId };
        if (date) {
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
        return attendances.map(att => {
            let workHour = null;
            if (att.checkIn && att.checkOut) {
                workHour = (0, workhour_1.calculateWorkHour)(att.checkIn, att.checkOut);
            }
            return {
                ...att,
                type: att.checkOut ? 'checkout' : (att.status === 'late' ? 'late' : 'checkin'),
                workHour,
            };
        });
    }
    async getSummary(user, startDate, endDate, userId) {
        const where = {};
        if (startDate && endDate) {
            let zonaSchedules = [];
            if (user.role === 'admin') {
                zonaSchedules = await this.prisma.zonaSchedule.findMany({
                    where: { zona: { companyId: user.companyId } },
                    select: { timezone: true, zonaId: true }
                });
            }
            else {
                zonaSchedules = await this.prisma.zonaSchedule.findMany({
                    where: { zona: { attendances: { some: { userId: user.id } } } },
                    select: { timezone: true, zonaId: true }
                });
            }
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
            if (userId)
                where.userId = Number(userId);
        }
        else {
            where.userId = user.id;
        }
        const [onTime, late] = await Promise.all([
            this.prisma.attendance.count({ where: { ...where, status: 'on-time' } }),
            this.prisma.attendance.count({ where: { ...where, status: 'late' } })
        ]);
        return { onTime, late, absent: 0 };
    }
    async getEmployeeHistory(user, startDate, endDate, userId) {
        const where = {};
        if (startDate && endDate) {
            let zonaSchedules = [];
            if (user.role === 'admin') {
                zonaSchedules = await this.prisma.zonaSchedule.findMany({
                    where: { zona: { companyId: user.companyId } },
                    select: { timezone: true, zonaId: true }
                });
            }
            else {
                zonaSchedules = await this.prisma.zonaSchedule.findMany({
                    where: { zona: { attendances: { some: { userId: user.id } } } },
                    select: { timezone: true, zonaId: true }
                });
            }
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
            if (userId)
                where.userId = Number(userId);
        }
        else {
            where.userId = user.id;
        }
        const attendances = await this.prisma.attendance.findMany({
            where,
            include: { user: { select: { name: true, email: true, role: true } }, zona: { select: { id: true, name: true, companyId: true, schedules: true } } },
            orderBy: { date: 'desc' }
        });
        return attendances.map((att) => {
            let workHour = null;
            if (att.checkIn && att.checkOut) {
                workHour = (0, workhour_1.calculateWorkHour)(att.checkIn, att.checkOut);
            }
            return {
                ...att,
                workHour,
            };
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map