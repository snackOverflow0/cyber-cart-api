import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
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
}
