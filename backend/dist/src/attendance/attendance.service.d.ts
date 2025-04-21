import { PrismaService } from '../prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    createAttendance(userId: number, qrValue: string, type: 'checkin' | 'checkout'): Promise<{
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
    getAttendanceByUser(userId: number, date?: Date): Promise<({
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
