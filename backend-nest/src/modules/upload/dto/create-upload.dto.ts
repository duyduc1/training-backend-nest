import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUploadDto {
    @IsString()
    @IsNotEmpty()
    nameUpload: string;

    @IsOptional()
    @IsString()
    description: string;
}
