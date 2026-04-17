import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('users')
export class User {
  // Dung uuid cho id thay vi so tu tang
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  fullName!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  address!: string;

  // Su dung Enum Role da tao, mac dinh la USER
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems!: CartItem[];

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
