import { IsEmail, IsNotEmpty, MinLength, IsNumber, IsOptional } from 'class-validator';
import { Role } from 'src/enum/role.enum';

export class RegisterDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsNumber()
  numberPhone: number;
}
