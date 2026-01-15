import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  inviterAccountId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  inviteeAccountId: number;
}
