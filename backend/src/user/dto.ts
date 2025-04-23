export class RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: string; // employee | admin
  companyId: number;
}

export class LoginDto {
  email: string;
  password: string;
}
