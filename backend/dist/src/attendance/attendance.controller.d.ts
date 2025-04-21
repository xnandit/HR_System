import { AttendanceService } from './attendance.service';
import { Request } from 'express';
export declare class AttendanceController {
    private attendanceService;
    constructor(attendanceService: AttendanceService);
    createAttendance(req: Request, qrValue: string, type: 'checkin' | 'checkout'): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        zonaId: number;
        userId: number;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        zonaId: number;
        userId: number;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: string | null;
    })[]>;
}
