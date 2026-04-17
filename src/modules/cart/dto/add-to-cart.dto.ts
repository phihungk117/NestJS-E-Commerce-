import { IsUUID, IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsUUID()
  productId!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity!: number;
}

export class UpdateCartDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;
}
