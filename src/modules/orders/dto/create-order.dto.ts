import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';

export class CreateOrderDto {
  @IsNumber()
  totalAmount!: number;

  // Kiem tra trang thai don hang khi tao moi
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Trang thai don hang khong hop le' })
  status?: OrderStatus;
}
