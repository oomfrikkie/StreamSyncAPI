import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDefined } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 1 })
  @IsDefined()
  inviterAccountId: number;

  @ApiProperty({ example: 2 })
  @IsDefined()
  inviteeAccountId: number;
}
