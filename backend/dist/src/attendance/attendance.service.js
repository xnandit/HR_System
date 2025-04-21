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
        const start = localToUtc(new Date(todayZoned.getFullYear(), todayZoned.getMonth(), todayZoned.getDate(), 0, 0, 0, 0));
        const end = localToUtc(new Date(todayZoned.getFullYear(), todayZoned.getMonth(), todayZoned.getDate(), 23, 59, 59, 999));
        const zonedNow = (0, date_fns_tz_1.fromZonedTime)(todayZoned, timeZone);
        const existing = await this.prisma.attendance.findFirst({
            where: {
                userId,
                zonaId: zona.id,
                type,
                createdAt: { gte: start, lte: end },
            },
        });
        if (existing) {
            throw new common_1.ForbiddenException(`Sudah melakukan ${type} hari ini di zona ini`);
        }
        let attendanceType = type;
        if (type === 'checkin') {
            const schedule = zona.schedules[0];
            if (schedule) {
                const [h, m] = schedule.checkinTime.split(':').map(Number);
                const checkinTime = new Date(todayZoned.getFullYear(), todayZoned.getMonth(), todayZoned.getDate(), h, m, 0, 0);
                const toleranceMs = schedule.toleranceMin * 60 * 1000;
                if (now.getTime() > checkinTime.getTime() + toleranceMs) {
                    attendanceType = 'late';
                }
            }
        }
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
    async getAttendanceByUser(userId, date) {
        const where = { userId };
        if (date) {
            where.createdAt = {
                gte: new Date(date.setHours(0, 0, 0, 0)),
                lt: new Date(date.setHours(23, 59, 59, 999)),
            };
        }
        return this.prisma.attendance.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { zona: { select: { name: true, company: { select: { name: true } } } } },
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map