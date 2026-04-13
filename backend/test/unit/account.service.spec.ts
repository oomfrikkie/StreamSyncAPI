import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { Account } from 'src/account/account.entity';
import { Profile } from 'src/profile/profile.entity';
import { AccountTokenService } from 'src/account/token/account-token.service';

const mockAccountRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockProfileRepo = () => ({
  find: jest.fn(),
});

const mockTokenService = () => ({
  createToken: jest.fn(),
  verifyToken: jest.fn(),
  getTokenEntity: jest.fn(),
});

describe('AccountService', () => {
  let service: AccountService;
  let accountRepo: ReturnType<typeof mockAccountRepo>;
  let profileRepo: ReturnType<typeof mockProfileRepo>;
  let tokenService: ReturnType<typeof mockTokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: getRepositoryToken(Account), useFactory: mockAccountRepo },
        { provide: getRepositoryToken(Profile), useFactory: mockProfileRepo },
        { provide: AccountTokenService, useFactory: mockTokenService },
      ],
    }).compile();

    service = module.get(AccountService);
    accountRepo = module.get(getRepositoryToken(Account));
    profileRepo = module.get(getRepositoryToken(Profile));
    tokenService = module.get(AccountTokenService);
  });

  describe('findById', () => {
    it('returns an AccountDto when the account exists', async () => {
      accountRepo.findOne.mockResolvedValue({
        account_id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      });

      const result = await service.findById(1);

      expect(result.email).toBe('test@example.com');
      expect(result.first_name).toBe('Test');
    });

    it('throws NotFoundException when account does not exist', async () => {
      accountRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('throws BadRequestException for invalid email format', async () => {
      await expect(
        service.create({ email: 'not-an-email', password: 'strongpass123', first_name: 'T', last_name: 'U' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when email already exists', async () => {
      accountRepo.findOne.mockResolvedValue({ account_id: 1, email: 'dup@example.com' });

      await expect(
        service.create({ email: 'dup@example.com', password: 'strongpass123', first_name: 'T', last_name: 'U' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates and saves a new account, sends verification token', async () => {
      accountRepo.findOne.mockResolvedValue(null);
      accountRepo.create.mockReturnValue({ account_id: 2, email: 'new@example.com', first_name: 'New', last_name: 'User' });
      accountRepo.save.mockResolvedValue({ account_id: 2, email: 'new@example.com', first_name: 'New', last_name: 'User' });
      tokenService.createToken.mockResolvedValue(undefined);

      const result = await service.create({
        email: 'new@example.com',
        password: 'strongpass123',
        first_name: 'New',
        last_name: 'User',
      });

      expect(accountRepo.save).toHaveBeenCalled();
      expect(tokenService.createToken).toHaveBeenCalledWith(
        expect.objectContaining({ token_type: 'EMAIL_VERIFICATION' }),
      );
      expect(result.account.email).toBe('new@example.com');
    });
  });

  describe('getProfilesByAccount', () => {
    it('returns profiles for a given account', async () => {
      profileRepo.find.mockResolvedValue([{ profile_id: 1, account_id: 1, name: 'Profile A' }]);

      const result = await service.getProfilesByAccount(1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Profile A');
    });

    it('returns empty array when account has no profiles', async () => {
      profileRepo.find.mockResolvedValue([]);

      const result = await service.getProfilesByAccount(42);

      expect(result).toEqual([]);
    });
  });
});
