import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    ProductName: string;

    @IsNumber()
    @IsNotEmpty()
    Price: number;

    @IsString()
    @IsNotEmpty()
    Description: string;
}
