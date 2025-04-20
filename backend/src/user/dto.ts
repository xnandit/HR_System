export class RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: string; // employee | admin
}

export class LoginDto {
  email: string;
  password: string;
}
