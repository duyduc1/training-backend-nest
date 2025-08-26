import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEmail } from "class-validator";
import { Role } from "../role.enum";


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    Username: string;

    @IsNumber()
    @IsOptional()
    NumberPhone: number;

    @IsString()
    @IsNotEmpty()
    Password: string;

    @IsEmail()
    @IsNotEmpty()
    Email: string;

    @IsNotEmpty()
    Role: Role
}
