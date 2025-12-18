import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './discount.entity';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  async getActiveDiscountForAccount(accountId: number): Promise<Discount | null> {
    return this.discountRepository.findOne({
      where: {
        accountId,
        active: true,
      },
    });
  }
}
