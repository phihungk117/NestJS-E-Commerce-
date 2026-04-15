import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
    });

    const total = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    return { items, total, count: items.length };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productsService.findOne(dto.productId);
    
    if (!product.isActive) {
      throw new BadRequestException('Sản phẩm không còn bán');
    }
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }

    // Nếu đã có trong giỏ → tăng số lượng
    let cartItem = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId },
    });

    if (cartItem) {
      cartItem.quantity += dto.quantity;
      if (cartItem.quantity > product.stock) {
        throw new BadRequestException('Tổng số lượng vượt quá tồn kho');
      }
    } else {
      cartItem = this.cartRepository.create({
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      });
    }

    return this.cartRepository.save(cartItem);
  }

  async updateQuantity(userId: string, itemId: string, dto: UpdateCartDto) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
      relations: ['product'],
    });
    
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity > item.product.stock) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }

    item.quantity = dto.quantity;
    return this.cartRepository.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    
    await this.cartRepository.remove(item);
    return { message: 'Đã xóa khỏi giỏ hàng' };
  }

  async clearCart(userId: string) {
    await this.cartRepository.delete({ userId });
    return { message: 'Đã xóa toàn bộ giỏ hàng' };
  }
}