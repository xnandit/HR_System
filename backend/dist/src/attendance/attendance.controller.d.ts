import { AttendanceService } from './attendance.service';
import { Request } from 'express';
export declare class AttendanceController {
    private attendanceService;
    constructor(attendanceService: AttendanceService);
    createAttendance(req: Request, qrValue: string, type: 'checkin' | 'checkout'): Promise<{
        zona: {
            name: string;
            company: {
                name: string;
            };
        };
    } & {
        id: number;
        userId: number;
        zonaId: number;
        type: import(".prisma/client").$Enums.AttendanceType;
        createdAt: Date;
    }>;
    getAttendance(req: Request, date?: string): Promise<({
        zona: {
            name: string;
            company: {
                name: string;
            };
        };
    } & {
        id: number;
        userId: number;
        zonaId: number;
        type: import(".prisma/client").$Enums.AttendanceType;
        createdAt: Date;
    })[]>;
}
