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

  async getActiveDiscountForAccount(
    accountId: number,
  ): Promise<Discount | null> {
    const today = new Date().toISOString().split('T')[0];

    return this.discountRepository
      .createQueryBuilder('d')
      .where('d.account_id = :accountId', { accountId })
      .andWhere('d.active = true')
      .andWhere('d.valid_from <= :today', { today })
      .andWhere('d.valid_until >= :today', { today })
      .orderBy('d.valid_until', 'DESC')
      .getOne();
  }
}
