import { Controller, Post, Body, Param, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto-invitation/create-invitation.dto';
import { InvitationResponseDto } from './dto-invitation/invitation-response.dto';
import { ApiProduces, ApiOkResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/xml', 'application/json')
  @ApiBody({ type: CreateInvitationDto, description: 'Create invitation', required: true })
  @ApiOkResponse({ type: InvitationResponseDto })
  @Post()
  async createInvitation(
    @Body() dto: CreateInvitationDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const invitation = await this.invitationService.createInvitation(
      dto.inviterAccountId,
      dto.inviteeAccountId,
    );
    const dtoResult = Object.assign(new InvitationResponseDto(), {
      status: invitation.status,
      discount_expiry_date: invitation.discountExpiryDate
        ? invitation.discountExpiryDate.toISOString().split('T')[0]
        : undefined,
    });
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('invitation', dtoResult));
    }
    return res.json(dtoResult);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: InvitationResponseDto })
  @Post('accept/:id')
  async acceptInvitation(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const invitation = await this.invitationService.acceptInvitation(id);
    if (!invitation) return res.status(404).send();
    const dtoResult = Object.assign(new InvitationResponseDto(), {
      status: invitation.status,
      discount_expiry_date: invitation.discountExpiryDate
        ? invitation.discountExpiryDate.toISOString().split('T')[0]
        : undefined,
    });
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('invitation', dtoResult));
    }
    return res.json(dtoResult);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: [InvitationResponseDto] })
  @Get('account/:accountId')
  async getInvitationsForAccount(@Param('accountId') accountId: number, @Req() req: Request, @Res() res: Response) {
    const invitations = await this.invitationService.getInvitationsForAccount(accountId);
    const dtoResult = invitations.map(invitation => Object.assign(new InvitationResponseDto(), {
      status: invitation.status,
      discount_expiry_date: invitation.discountExpiryDate
        ? invitation.discountExpiryDate.toISOString().split('T')[0]
        : undefined,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('invitations', { invitation: dtoResult }));
    }
    return res.json(dtoResult);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: InvitationResponseDto })
  @Get(':id')
  async getInvitationById(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const invitation = await this.invitationService.getInvitationById(id);
    if (!invitation) return res.status(404).send();
    const dtoResult = Object.assign(new InvitationResponseDto(), {
      status: invitation.status,
      discount_expiry_date: invitation.discountExpiryDate
        ? invitation.discountExpiryDate.toISOString().split('T')[0]
        : undefined,
    });
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('invitation', dtoResult));
    }
    return res.json(dtoResult);
  }
}