import { PrismaService } from '../prisma.service';
export declare class QrService {
    private prisma;
    constructor(prisma: PrismaService);
    generateZonaQr(zonaId: number): Promise<string>;
}
