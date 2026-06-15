import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal:true }),
    
    PrismaModule,
    
    ProductsModule,
    
    CartsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
