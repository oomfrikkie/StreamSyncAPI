import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 1 })
  inviterAccountId: number;

  @ApiProperty({ example: 2 })
  inviteeAccountId: number;
}
