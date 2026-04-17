import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  //tiêm cartService vào contro để lát có thể sử dụng logic
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post()
  addToCart(@CurrentUser() user: User, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.id, dto);
  }

  @Patch(':itemId')
  updateQuantity(
    @CurrentUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateQuantity(user.id, itemId, dto);
  }

  @Delete('clear')
  clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }

  @Delete(':itemId')
  removeItem(
    @CurrentUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }
}
