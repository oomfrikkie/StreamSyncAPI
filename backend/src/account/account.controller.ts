import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';
import { ForgotPasswordDto } from './dto-account/forgot-password.dto';
import { ResetPasswordDto } from './dto-account/reset-password.dto';
import { AccountTokenService } from './token/account-token.service';
import { ProfileService } from 'src/profile/profile.service';

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

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.accountService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.accountService.resetPassword(dto);
  }

  @Get(':id')
  getAccountById(@Param('id') id: string) {
    return this.accountService.findById(Number(id));
  }

 
 @Get(':accountId/profiles')
getProfilesByAccount(@Param('accountId') accountId: string) {
  return this.accountService.getProfilesByAccount(Number(accountId));
}

}
