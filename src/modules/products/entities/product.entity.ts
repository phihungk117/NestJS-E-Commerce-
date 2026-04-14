import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
// LƯU Ý: Nếu chưa có 2 file này, hãy tạm comment lại để code không báo lỗi nhé!
import { OrderItem } from '../../orders/entities/order-item.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL', // Nếu Category bị xóa cứng, product.categoryId sẽ thành NULL
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column({ nullable: true })
  categoryId!: string;

  // Nếu chưa có OrderItem, comment đoạn này lại
  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems!: OrderItem[];

  // Nếu chưa có CartItem, comment đoạn này lại
  @OneToMany(() => CartItem, (item) => item.product)
  cartItems!: CartItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}