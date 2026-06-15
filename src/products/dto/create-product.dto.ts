import { IsNotEmpty, IsString, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name cannot be left blank' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Product description is required' })
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid currency number with up to 2 decimal places' })
  @Min(0.01, { message: 'Price must be at least 0.01' })
  price!: number;

  @IsNumber()
  @Min(0, { message: 'Initial inventory stock cannot be a negative value' })
  stock!: number;

  @IsUUID('4', { message: 'Vendor ID must be a structurally valid UUIDv4' })
  vendorId!: string;
}