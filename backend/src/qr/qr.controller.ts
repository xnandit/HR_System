import { Controller, Get, Param, Res, ParseIntPipe } from '@nestjs/common';
import { QrService } from './qr.service';
import { Response } from 'express';

@Controller('company/:companyId/zona')
export class QrController {
  constructor(private qrService: QrService) {}

  @Get(':zonaId/qr')
  async getZonaQr(
    @Param('zonaId', ParseIntPipe) zonaId: number,
    @Res() res: Response
  ) {
    const qrDataUrl = await this.qrService.generateZonaQr(zonaId);
    const img = Buffer.from(qrDataUrl.split(",")[1], 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.send(img);
  }
}
