import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';
export declare class UserService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    getProfile(userId: number): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
    }>;
}
