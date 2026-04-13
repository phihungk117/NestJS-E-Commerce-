import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';

import { Order } from '../../orders/entities/order.entity';
// import { CartItem } from '../../cart/entities/cart-item.entity';

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

  // Moi quan he 1-N voi don hang (Tạm thời comment lại vì entity Order chưa có properties 'user')
  // @OneToMany(() => Order, (order) => (order as any).user)
  // orders!: Order[];

  // Moi quan he 1-N voi gio hang (Tạm thời comment lại vì module Cart chưa có entity CartItem)
  // @OneToMany('CartItem', (cartItem: any) => cartItem.user)
  // cartItems!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
