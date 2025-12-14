import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDate,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTokenDto {
  @ApiProperty({ example: 'EMAIL_VERIFICATION' })
  @IsString()
  @IsNotEmpty()
  token_type: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  account_id: number;

  @ApiProperty({ example: '2025-12-15T12:00:00Z' })
  @Type(() => Date)   // 🔴 REQUIRED for Date parsing
  @IsDate()
  expires_at: Date;
}
