import { ApiProperty } from '@nestjs/swagger';

export class InvitationDto {
  @ApiProperty({ example: 1, xml: { name: 'invitation_id' } })
  invitation_id: number;

  @ApiProperty({ example: 1, xml: { name: 'inviterAccountId' } })
  inviterAccountId: number;

  @ApiProperty({ example: 2, xml: { name: 'inviteeAccountId' } })
  inviteeAccountId: number;

  @ApiProperty({ example: 'PENDING', xml: { name: 'status' } })
  status: string;

  @ApiProperty({ example: '2026-01-01', required: false, xml: { name: 'discount_expiry_date' } })
  discount_expiry_date?: string;
}
