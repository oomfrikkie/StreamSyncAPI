import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsDateString } from 'class-validator';

export class DiscountResponseDto {
  @ApiProperty({ example: 20 })
  @IsInt()
  percentage: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  valid_until: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean;
}
