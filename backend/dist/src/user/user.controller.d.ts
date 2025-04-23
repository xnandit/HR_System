import { UserService } from './user.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
export declare class UserController {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
        };
    }>;
    getProfile(req: Request): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
    }>;
    getCompanyUsers(req: Request): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
    }[]>;
    searchUser(req: Request, name: string): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
    }[]>;
}
