import { Controller, Get, Query } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountResponseDto } from './dto-discount/discount-response.dto';

@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get('me')
  async getMyDiscount(
    @Query('original_price') originalPrice?: string,
  ): Promise<DiscountResponseDto | null> {
    const accountId = 2;
    const discount =
      await this.discountService.getActiveDiscountForAccount(accountId);

    if (!discount) return null;

    let price: number | undefined;
    if (originalPrice !== undefined) {
      const parsed = parseFloat(originalPrice);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        const discounted = parsed * (1 - discount.percentage / 100);
        price = Math.round((discounted + Number.EPSILON) * 100) / 100;
      }
    }

    const response: DiscountResponseDto = {
      percentage: discount.percentage,
      valid_until: discount.validUntil.toISOString().split('T')[0],
      active: discount.active,
    };

    if (price !== undefined) response.price = price;

    return response;
  }
}
