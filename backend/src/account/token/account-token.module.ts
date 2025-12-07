import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountToken } from './account-token.entity';
import { Account } from '../account.entity';
import { AccountTokenService } from './account-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountToken, Account]),
  ],
  providers: [AccountTokenService],
  exports: [AccountTokenService], // IMPORTANT so account.service can use it
})
export class AccountTokenModule {}
