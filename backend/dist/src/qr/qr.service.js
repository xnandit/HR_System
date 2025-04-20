"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const QRCode = require("qrcode");
let QrService = class QrService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateZonaQr(zonaId) {
        const zona = await this.prisma.zona.findUnique({
            where: { id: zonaId },
            include: { company: true },
        });
        if (!zona)
            throw new common_1.NotFoundException('Zona tidak ditemukan');
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
};
exports.QrService = QrService;
exports.QrService = QrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QrService);
//# sourceMappingURL=qr.service.js.map