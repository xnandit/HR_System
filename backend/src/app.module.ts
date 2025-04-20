import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';
import { AttendanceModule } from './attendance/attendance.module';
import { JwtStrategy } from './utils/jwt.strategy';
import { QrModule } from './qr/qr.module';

console.log('DEBUG JWT_SECRET:', process.env.JWT_SECRET);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default_jwt_secret',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AttendanceModule,
    QrModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
  exports: [JwtModule],
})
export class AppModule {}
