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
    getAttendanceByUser(userId: number, date?: Date): Promise<{
        type: string;
        workHour: string | null;
        zona: {
            name: string;
            company: {
                name: string;
            };
        };
        id: number;
        createdAt: Date;
        updatedAt: Date;
        zonaId: number;
        userId: number;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: string | null;
    }[]>;
    getSummary(user: any, startDate?: string, endDate?: string, userId?: string): Promise<{
        onTime: number;
        late: number;
        absent: number;
    }>;
    getEmployeeHistory(user: any, startDate?: string, endDate?: string, userId?: string): Promise<{
        workHour: string | null;
        user: {
            email: string;
            name: string;
            role: string;
        };
        zona: {
            id: number;
            name: string;
            companyId: number;
            schedules: {
                id: number;
                zonaId: number;
                checkinTime: string;
                checkoutTime: string;
                toleranceMin: number;
                timezone: number;
            }[];
        };
        id: number;
        createdAt: Date;
        updatedAt: Date;
        zonaId: number;
        userId: number;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: string | null;
    }[]>;
}
