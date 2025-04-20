import { PrismaService } from '../prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    createAttendance(userId: number, qrValue: string, type: 'checkin' | 'checkout'): Promise<{
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
    getAttendanceByUser(userId: number, date?: Date): Promise<({
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
