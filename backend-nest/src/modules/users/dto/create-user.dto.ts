import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEmail } from "class-validator";
import { Role } from "src/enum/role.enum";


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsNumber()
    @IsOptional()
    numberPhone: number;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    role: Role
}
