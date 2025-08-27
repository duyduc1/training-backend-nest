import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUploadDto {
    @IsString()
    @IsNotEmpty()
    NameUpload: string;

    @IsOptional()
    @IsString()
    Description: string;
}
