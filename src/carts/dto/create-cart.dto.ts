import { IsUUID, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID('4', { message: 'User ID must be a valid UUIDv4 format' })
  userId!: string;

  @IsUUID('4', { message: 'Product ID must be a valid UUIDv4 format' })
  productId!: string;

  @IsInt({ message: 'Quantity must be a whole whole number' })
  @Min(1, { message: 'You must add at least 1 item to the cart' })
  quantity!: number;
}