import { Body, Controller, Get, Post, Req, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    // req.user di-attach oleh JwtAuthGuard
    // @ts-ignore
    return this.userService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company')
  async getCompanyUsers(@Req() req: Request) {
    // @ts-ignore
    return this.userService.getCompanyUsers(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUser(@Req() req: Request, @Query('name') name: string) {
    // @ts-ignore
    return this.userService.searchUser(req.user, name);
  }
}
