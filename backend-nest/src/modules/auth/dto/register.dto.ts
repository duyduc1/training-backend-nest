import { IsEmail, IsNotEmpty, MinLength, IsNumber, IsOptional } from 'class-validator';
import { Role } from 'src/modules/users/role.enum';

export class RegisterDto {
  @IsNotEmpty()
  Username: string;

  @IsEmail()
  Email: string;

  @MinLength(6)
  @IsNotEmpty()
  Password: string;

  @IsOptional()
  @IsNumber()
  NumberPhone: number;
}
