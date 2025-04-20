import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [QrService, PrismaService],
  controllers: [QrController],
})
export class QrModule {}
