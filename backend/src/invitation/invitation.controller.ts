import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto-invitation/create-invitation.dto';
import { InvitationResponseDto } from './dto-invitation/invitation-response.dto';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  async createInvitation(
    @Body() dto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationService.createInvitation(
      dto.inviterAccountId,
      dto.inviteeAccountId,
    );

    return {
      status: invitation.status,
      discount_expiry_date: invitation.discountExpiryDate
        ? invitation.discountExpiryDate.toISOString().split('T')[0]
        : undefined,
    };
  }

  @Post('accept/:id')
  async acceptInvitation(
    @Param('id') id: number,
  ): Promise<InvitationResponseDto | null> {
    const invitation = await this.invitationService.acceptInvitation(id);
    if (!invitation) return null;

    return {
      status: invitation.status,
      discount_expiry_date: invitation.discountExpiryDate
        ? invitation.discountExpiryDate.toISOString().split('T')[0]
        : undefined,
    };
  }

  @Get('account/:accountId')
  async getInvitationsForAccount(@Param('accountId') accountId: number) {
    return this.invitationService.getInvitationsForAccount(accountId);
  }

  @Get(':id')
  async getInvitationById(
    @Param('id') id: number,
  ): Promise<InvitationResponseDto | null> {
    const invitation = await this.invitationService.getInvitationById(id);
    if (!invitation) return null;

    return {
      status: invitation.status,
      discount_expiry_date: invitation.discountExpiryDate
        ? invitation.discountExpiryDate.toISOString().split('T')[0]
        : undefined,
    };
  }
}