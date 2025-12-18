import { Controller, Get } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountResponseDto } from './dto-discount/discount-response.dto';

@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get('me')
  async getMyDiscount(): Promise<DiscountResponseDto | null> {
    const accountId = 2; // normally from auth
    const discount = await this.discountService.getActiveDiscountForAccount(accountId);

    if (!discount) return null;

    return {
      percentage: discount.percentage,
      valid_until: discount.validUntil.toISOString().split('T')[0],
      active: discount.active,
    };
  }
}