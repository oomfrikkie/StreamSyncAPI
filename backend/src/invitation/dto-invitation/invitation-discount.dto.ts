import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class InvitationDiscountDto {
  @ApiProperty({ example: 'ACCEPTED' })
  @IsString()
  status: string;

  @ApiProperty({ example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  discount_expiry_date?: string;
}