import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from './account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

import { AccountTokenModule } from './token/account-token.module';
import { Profile } from 'src/profile/profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Profile]), 
    AccountTokenModule,
    AuthModule,
  ],

  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
