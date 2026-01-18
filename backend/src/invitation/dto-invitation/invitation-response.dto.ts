import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class InvitationResponseDto {
  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: '2026-01-01', required: false })
  discount_expiry_date?: string;
}
