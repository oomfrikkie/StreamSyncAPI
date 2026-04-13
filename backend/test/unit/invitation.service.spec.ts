import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvitationService } from 'src/invitation/invitation.service';
import { Invitation } from 'src/invitation/invitation.entity';

const mockInvitationRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
});

describe('InvitationService', () => {
  let service: InvitationService;
  let repo: ReturnType<typeof mockInvitationRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        { provide: getRepositoryToken(Invitation), useFactory: mockInvitationRepo },
      ],
    }).compile();

    service = module.get(InvitationService);
    repo = module.get(getRepositoryToken(Invitation));
  });

  describe('createInvitation', () => {
    it('creates and saves a PENDING invitation', async () => {
      const invitation = { invitationId: 1, inviterAccountId: 1, inviteeAccountId: 2, status: 'PENDING' };
      repo.create.mockReturnValue(invitation);
      repo.save.mockResolvedValue(invitation);

      const result = await service.createInvitation(1, 2);

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING' }));
      expect(repo.save).toHaveBeenCalled();
      expect(result.status).toBe('PENDING');
    });
  });

  describe('acceptInvitation', () => {
    it('sets status to ACCEPTED and saves', async () => {
      const invitation = { invitationId: 1, status: 'PENDING', acceptedTimestamp: null };
      repo.findOneBy.mockResolvedValue(invitation);
      repo.save.mockImplementation(async (inv) => inv);

      const result = await service.acceptInvitation(1);

      expect(result?.status).toBe('ACCEPTED');
      expect(result?.acceptedTimestamp).not.toBeNull();
    });

    it('returns null when invitation does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.acceptInvitation(999);

      expect(result).toBeNull();
    });
  });

  describe('getInvitationById', () => {
    it('returns the invitation when found', async () => {
      const invitation = { invitationId: 1, status: 'PENDING' };
      repo.findOneBy.mockResolvedValue(invitation);

      const result = await service.getInvitationById(1);

      expect(result?.status).toBe('PENDING');
    });

    it('returns null when not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.getInvitationById(999);

      expect(result).toBeNull();
    });
  });

  describe('getInvitationsForAccount', () => {
    it('returns invitations where account is inviter or invitee', async () => {
      const invitations = [
        { invitationId: 1, inviterAccountId: 1, inviteeAccountId: 2, status: 'PENDING' },
        { invitationId: 2, inviterAccountId: 3, inviteeAccountId: 1, status: 'ACCEPTED' },
      ];
      repo.find.mockResolvedValue(invitations);

      const result = await service.getInvitationsForAccount(1);

      expect(result).toHaveLength(2);
    });

    it('returns empty array when no invitations exist for the account', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.getInvitationsForAccount(999);

      expect(result).toEqual([]);
    });
  });
});
