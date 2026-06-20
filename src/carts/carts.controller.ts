import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/create-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('items')
  async addItem(@Body() dto: AddToCartDto) {
    return this.cartsService.addItemToCart(dto)
  }

  @Get('users/:userId')
  async getUserCart(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.cartsService.getCart(userId)
  }

  @Patch('items/:cartItemId')
  async updateQuantity(
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
    @Body('quantity', ParseIntPipe) quantity: number
  ) {
    return this.cartsService.updateItemQuantity(cartItemId, quantity)
  }

  @Delete('items/:cartItemId') 
  async removeItem(@Param('cartItemId', ParseUUIDPipe) cartItemId: string) {
    return this.cartsService.removeCartItem(cartItemId)
  }

  @Delete('users/:userId/clear') 
  async clearUserCart(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.cartsService.clearCart(userId)
  }
}
