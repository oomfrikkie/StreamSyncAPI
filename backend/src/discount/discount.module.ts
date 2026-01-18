import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './discount.entity';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Discount])],
  providers: [DiscountService],
  controllers: [DiscountController],
  exports: [DiscountService],
})
export class DiscountModule {}
