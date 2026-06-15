import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.vendorId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.vendorId} was not found.`);
    }

    if (user.role !== Role.VENDOR && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only registered vendor or administrator accounts can list products.');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        vendorId: dto.vendorId,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
