import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto{
    @IsString()
    name!:string;

    @IsOptional()
    @IsString()
    description?: string;

    @Type(() => Number)
    @IsNumber({maxDecimalPlaces:2})
    @IsPositive()//Giá sản phẩm phải là số dương (lớn hơn 0), không thể bán sản phẩm với giá âm được.
    price!:number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    stock!: number;

    @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}