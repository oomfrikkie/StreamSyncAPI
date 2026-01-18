import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { AccountToken } from './account-token.entity';
import { Account } from '../account.entity';
import { CreateTokenDto } from './dto-token/create-token.dto';
import { VerifyTokenDto } from './dto-token/verify-token.dto';

@Injectable()
export class AccountTokenService {
  constructor(
    @InjectRepository(AccountToken)
    private readonly tokenRepo: Repository<AccountToken>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async createToken(dto: CreateTokenDto) {
    const account = await this.accountRepo.findOne({
      where: { account_id: dto.account_id },
    });

    if (!account) throw new NotFoundException('Account not found');

    const token = randomUUID();

    const tokenEntity = this.tokenRepo.create({
      token,
      token_type: dto.token_type,
      expires_at: dto.expires_at,
      account,
    });

    await this.tokenRepo.save(tokenEntity);

    return {
      message: 'Token created',
      token,
    };
  }

  // ✅ missing method — now added
  async getTokenEntity(token: string) {
    return this.tokenRepo.findOne({
      where: { token },
      relations: ['account'],
    });
  }

  async verifyToken(dto: VerifyTokenDto) {
    const tokenEntity = await this.tokenRepo.findOne({
      where: {
        token: dto.token,
        token_type: dto.token_type,
      },
      relations: ['account'],
    });

    if (!tokenEntity) throw new NotFoundException('Invalid token');
    if (tokenEntity.is_used) throw new BadRequestException('Token already used');
    if (tokenEntity.expires_at < new Date()) throw new BadRequestException('Token expired');

    tokenEntity.is_used = true;
    tokenEntity.used_at = new Date();
    await this.tokenRepo.save(tokenEntity);

    if (dto.token_type === 'EMAIL_VERIFICATION') {
      tokenEntity.account.is_verified = true;
      tokenEntity.account.status = 'VERIFIED';
      await this.accountRepo.save(tokenEntity.account);
      return { message: 'Email verified successfully' };
    }

    if (dto.token_type === 'PASSWORD_RESET') {
      return { message: 'Password reset token validated' };
    }

    return { message: 'Token verified' };
  }
}
