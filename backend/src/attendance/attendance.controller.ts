import { Controller, Post, Get, Req, UseGuards, Body, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  async createAttendance(
    @Req() req: Request,
    @Body('qrValue') qrValue: string,
    @Body('type') type: 'checkin' | 'checkout'
  ) {
    // @ts-ignore
    return this.attendanceService.createAttendance(req.user.sub, qrValue, type);
  }

  @Get()
  async getAttendance(@Req() req: Request, @Query('date') date?: string) {
    // @ts-ignore
    const userId = req.user.sub;
    return this.attendanceService.getAttendanceByUser(userId, date ? new Date(date) : undefined);
  }
}
