import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async addItemToCart(dto: AddToCartDto) {
    const { userId, productId, quantity } = dto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' does not exist inside our active catalog`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Insufficient inventory stock. Only ${product.stock} units available`);
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId }
      });
    }

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (existingCartItem) {
      const prospectiveQuantity = existingCartItem.quantity + quantity;

      if (product.stock < prospectiveQuantity) {
        throw new BadRequestException(`Cannot add more units. Total cart request (${prospectiveQuantity}) exceeds available store stock (${product.stock})`);
      }

      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: prospectiveQuantity }
      });
    } else {
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity
        }
      })
    }
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`No active shopping cart record found for user ID ${userId}`);
    }

    return cart;
  }
}
