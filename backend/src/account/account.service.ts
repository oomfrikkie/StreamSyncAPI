import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  // CREATE ACCOUNT
  async create(dto: CreateAccountDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const account = this.accountRepo.create({
      email: dto.email,
      password_hash: hashed,
    });

    return this.accountRepo.save(account);
  }

  // LOGIN
  async login(dto: LoginDto) {
    const account = await this.accountRepo.findOne({
      where: { email: dto.email },
    });

    if (!account) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(
      dto.password,
      account.password_hash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'Login successful',
      account_id: account.account_id,
    };
  }
}
