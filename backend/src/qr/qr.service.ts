import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generateZonaQr(zonaId: number) {
    const zona = await this.prisma.zona.findUnique({
      where: { id: zonaId },
      include: { company: true },
    });
    if (!zona) throw new NotFoundException('Zona tidak ditemukan');
    const qrPayload = {
      type: 'attendance_qr',
      companyId: zona.company.id,
      companyName: zona.company.name,
      zonaId: zona.id,
      zonaName: zona.name,
      issuedAt: new Date().toISOString(),
    };
    const qrString = JSON.stringify(qrPayload);
    return QRCode.toDataURL(qrString);
  }
}
