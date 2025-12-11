import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Account } from './account.entity';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';

import { AccountTokenService } from './token/account-token.service';
import { ForgotPasswordDto } from './dto-account/forgot-password.dto';
import { ResetPasswordDto } from './dto-account/reset-password.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    private readonly tokenService: AccountTokenService,
  ) {}

  async create(dto: CreateAccountDto) {
  if (!dto.email || !dto.password) {
    throw new BadRequestException('Email and password are required');
  }

  // EMAIL FORMAT CHECK
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dto.email)) {
    throw new BadRequestException('Invalid email format. Must contain @ and/or .com');
  }

  const existing = await this.accountRepo.findOne({
    where: { email: dto.email },
  });

  if (existing) {
    throw new BadRequestException('An account with this email already exists');
  }

  const hashed = await bcrypt.hash(dto.password, 10);

  const newAccount = this.accountRepo.create({
    email: dto.email,
    password_hash: hashed,
    is_verified: false,
    status: 'AWAITING_VERIFICATION',
    failed_login_attempts: 0,
  });

  const savedAccount = await this.accountRepo.save(newAccount);

  const tokenResult = await this.tokenService.createToken({
    token_type: 'EMAIL_VERIFICATION',
    account_id: savedAccount.account_id,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  return {
    message: 'Account created',
    account_id: savedAccount.account_id,
    email: savedAccount.email,
    verification_token: tokenResult.token,
    verification_link: `/account/verify/${tokenResult.token}`,
  };
}


  async login(dto: LoginDto) {
  // EMAIL FORMAT CHECK
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dto.email)) {
    throw new UnauthorizedException('Invalid email format');
  }

  const account = await this.accountRepo.findOne({
    where: { email: dto.email },
  });

  if (!account) throw new UnauthorizedException('Invalid credentials');

  if (account.status === 'AWAITING_VERIFICATION') {
    throw new UnauthorizedException('Email has not been verified');
  }

  const match = await bcrypt.compare(dto.password, account.password_hash);
  if (!match) throw new UnauthorizedException('Invalid credentials');

  return {
    message: 'Login successful',
    account_id: account.account_id,
  };
}


  async findById(id: number) {
    const account = await this.accountRepo.findOne({
      where: { account_id: id },
    });

    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async requestPasswordReset(dto: ForgotPasswordDto) {
    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }

    const account = await this.accountRepo.findOne({
      where: { email: dto.email },
    });

    if (!account) throw new NotFoundException('Account not found');

    const tokenResult = await this.tokenService.createToken({
      token_type: 'PASSWORD_RESET',
      account_id: account.account_id,
      expires_at: new Date(Date.now() + 1000 * 60 * 30),
    });

    return {
      message: 'Password reset token created',
      reset_token: tokenResult.token,
      reset_link: `/account/reset-password/${tokenResult.token}`,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (!dto.new_password) {
      throw new BadRequestException('New password is required');
    }

    await this.tokenService.verifyToken({
      token: dto.token,
      token_type: 'PASSWORD_RESET',
    });

    const tokenEntity = await this.tokenService.getTokenEntity(dto.token);

    if (!tokenEntity?.account)
      throw new NotFoundException('Account not found');

    const hashed = await bcrypt.hash(dto.new_password, 10);
    tokenEntity.account.password_hash = hashed;
    tokenEntity.account.failed_login_attempts = 0;

    await this.accountRepo.save(tokenEntity.account);

    return { message: 'Password updated successfully' };
  }
}
