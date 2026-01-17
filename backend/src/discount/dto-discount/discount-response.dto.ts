import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class DiscountResponseDto {
  @ApiProperty({ example: 20, xml: { name: 'percentage' } })
  @IsInt()
  percentage: number;

  @ApiProperty({ example: '2026-01-01', xml: { name: 'valid_until' } })
  @IsDateString()
  valid_until: string;

  @ApiProperty({ example: true, xml: { name: 'active' } })
  @IsBoolean()
  active: boolean;

  @ApiProperty({ example: 80, required: false, xml: { name: 'price' } })
  @IsOptional()
  @IsNumber()
  price?: number;
}
