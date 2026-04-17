import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) {}

  async create(user: User, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      let orderItems: { productId: string; quantity: number }[] = [];

      if (!dto.items || dto.items.length === 0) {
        const cart = await this.cartService.getCart(user.id);
        if (cart.items.length === 0) {
          throw new BadRequestException('Giỏ hàng trống');
        }
        orderItems = cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        }));
      } else {
        orderItems = dto.items;
      }

      let totalAmount = 0;
      const itemsToSave: Partial<OrderItem>[] = [];

      for (const item of orderItems) {
        const product = await this.productsService.findOne(item.productId);
        if (!product.isActive) {
          throw new BadRequestException(`Sản phẩm "${product.name}" không còn bán`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Sản phẩm "${product.name}" không đủ tồn kho`);
        }

        product.stock -= item.quantity;
        await manager.save(product);

        const subtotal = Number(product.price) * item.quantity;
        totalAmount += subtotal;

        itemsToSave.push({
          productId: product.id,
          productName: product.name,
          price: Number(product.price),
          quantity: item.quantity,
        });
      }

      const order = manager.create(Order, {
        userId: user.id,
        totalAmount,
        shippingAddress: dto.shippingAddress || user.address,
        note: dto.note,
        status: OrderStatus.PENDING,
      });
      const savedOrder = await manager.save(order);

      const orderItemEntities = itemsToSave.map((item) =>
        manager.create(OrderItem, { ...item, orderId: savedOrder.id }),
      );
      await manager.save(orderItemEntities);

      if (!dto.items || dto.items.length === 0) {
        await this.cartService.clearCart(user.id);
      }

      return this.findOne(savedOrder.id);
    });
  }

  async findAll(query?: { status?: OrderStatus; userId?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.userId) where.userId = query.userId;

    return this.orderRepository.find({
      where,
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMyOrders(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    return this.orderRepository.save(order);
  }

  async cancelOrder(id: string, user: User): Promise<Order> {
    const order = await this.findOne(id);

    if (order.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền hủy đơn này');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng đang chờ xử lý');
    }

    for (const item of order.items) {
      if (item.productId) {
        const product = await this.productsService.findOne(item.productId);
        product.stock += item.quantity;
        await this.productsService.update(product.id, { stock: product.stock });
      }
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}