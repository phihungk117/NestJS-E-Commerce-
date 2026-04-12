import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  // Dang ky Order entity voi TypeOrmModule
  imports: [TypeOrmModule.forFeature([Order])],
})
export class OrdersModule {}
