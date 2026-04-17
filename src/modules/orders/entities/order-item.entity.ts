import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column()
  orderId!: string;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ nullable: true })
  productId!: string;

  @Column()
  productName!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column()
  quantity!: number;
}
