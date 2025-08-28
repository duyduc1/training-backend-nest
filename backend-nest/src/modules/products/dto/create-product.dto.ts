import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    description: string;
}
