import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/enum/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}
