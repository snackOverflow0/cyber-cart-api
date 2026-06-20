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

  async updateItemQuantity(cartItemId: string, targetQuantity: number) {
    if (targetQuantity < 1) {
      throw new BadRequestException('Target allocation quantity must be at least 1 unit.')
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true }
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart line item with ID '${cartItemId}' was not found.`);
    }

    if (cartItem.product.stock < targetQuantity) {
      throw new BadRequestException(`Insufficient store stock. The vendor only has ${cartItem.product.stock} units of ${cartItem.product.name} left.`);
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: targetQuantity }
    });
  }

  async removeCartItem(cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart line item with ID '${cartItemId}' was not found.`);
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId }
    })

    return {
      message: 'Line item has been removed from your shopping cart successfully.'
    };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: userId },
    });

    if (!cart) {
      throw new NotFoundException(`No active shopping cart container found for user ID '${userId}'.`);
    }

    await this.prisma.cartItem.deleteMany({
      where: { id: cart.id }
    })

    return {
      message: 'Your shopping cart has been flushed completely clean.'
    }
  }
}
