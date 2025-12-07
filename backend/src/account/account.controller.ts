import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';
import { AccountTokenService } from './token/account-token.service';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: AccountTokenService,
  ) {}

  @Post('register')
  create(@Body() dto: CreateAccountDto) {
    return this.accountService.create(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.accountService.login(dto);
  }

  @Get('verify/:token')
  verify(@Param('token') token: string) {
    return this.tokenService.verifyToken({
      token,
      token_type: 'EMAIL_VERIFICATION',
    });
  }
}
