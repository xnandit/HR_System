export interface Attendance {
    id: number;
    userId: number;
    zonaId: number;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status?: string;
    createdAt: Date;
    updatedAt: Date;
}
