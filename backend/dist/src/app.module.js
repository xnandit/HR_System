"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma.service");
const user_module_1 = require("./user/user.module");
const attendance_module_1 = require("./attendance/attendance.module");
const jwt_strategy_1 = require("./utils/jwt.strategy");
const qr_module_1 = require("./qr/qr.module");
console.log('DEBUG JWT_SECRET:', process.env.JWT_SECRET);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'default_jwt_secret',
                    signOptions: { expiresIn: '7d' },
                }),
                inject: [config_1.ConfigService],
            }),
            user_module_1.UserModule,
            attendance_module_1.AttendanceModule,
            qr_module_1.QrModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService, jwt_strategy_1.JwtStrategy],
        exports: [jwt_1.JwtModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map