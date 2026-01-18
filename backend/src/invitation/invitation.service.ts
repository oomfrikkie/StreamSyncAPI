import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './invitation.entity';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
  ) {}

  async createInvitation(inviterAccountId: number, inviteeAccountId: number): Promise<Invitation> {
    const invitation = this.invitationRepository.create({
      inviterAccountId,
      inviteeAccountId,
      status: 'PENDING',
      sentTimestamp: new Date(),
    });
    return this.invitationRepository.save(invitation);
  }

  async acceptInvitation(invitationId: number): Promise<Invitation | null> {
    const invitation = await this.invitationRepository.findOneBy({ invitationId });
    if (!invitation) return null;
    invitation.status = 'ACCEPTED';
    invitation.acceptedTimestamp = new Date();
    // discount_expiry_date will be set by the trigger
    return this.invitationRepository.save(invitation);
  }

  async getInvitationById(invitationId: number): Promise<Invitation | null> {
    return this.invitationRepository.findOneBy({ invitationId });
  }

  async getInvitationsForAccount(accountId: number): Promise<Invitation[]> {
    return this.invitationRepository.find({
      where: [
        { inviterAccountId: accountId },
        { inviteeAccountId: accountId },
      ],
    });
  }
}
