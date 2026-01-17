import { Controller, Get, Query, Post, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import { DiscountService } from './discount.service';
import { DiscountResponseDto } from './dto-discount/discount-response.dto';

@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: DiscountResponseDto })
  @Get('me')
  async getMyDiscount(
    @Req() req: Request, @Res() res: Response,
    @Query('original_price') originalPrice?: string
  ) {
    const accountId = 2;
    const discount =
      await this.discountService.getActiveDiscountForAccount(accountId);

    let price: number | undefined;
    if (!discount) {
      const response: DiscountResponseDto = {
        percentage: 0,
        valid_until: '',
        active: false,
      };
      if (price !== undefined) response.price = price;
      if (req.headers.accept && req.headers.accept.includes('application/xml')) {
        res.set('Content-Type', 'application/xml');
        return res.send(js2xmlparser.parse('discount', response));
      }
      return res.json(response);
    }

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

    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('discount', response));
    }
    return res.json(response);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: DiscountResponseDto })
  @Post('apply')
  async applyDiscount(@Body() body: { accountId: number; price: number }, @Req() req: Request, @Res() res: Response) {
    const { accountId, price } = body;
    const discount = await this.discountService.getActiveDiscountForAccount(accountId);
    let response: DiscountResponseDto;
    if (!discount) {
      response = { price, percentage: 0, valid_until: '', active: false };
    } else {
      const discounted = price * (1 - discount.percentage / 100);
      response = {
        price: Math.round((discounted + Number.EPSILON) * 100) / 100,
        percentage: discount.percentage,
        valid_until: discount.validUntil.toISOString().split('T')[0],
        active: discount.active,
      };
    }
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('discount', response));
    }
    return res.json(response);
  }
}
