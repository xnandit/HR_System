import { QrService } from './qr.service';
import { Response } from 'express';
export declare class QrController {
    private qrService;
    constructor(qrService: QrService);
    getZonaQr(zonaId: number, res: Response): Promise<void>;
}
