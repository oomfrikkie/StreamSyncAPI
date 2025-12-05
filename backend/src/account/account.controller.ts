import { Controller, Post, Body } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { LoginDto } from './dto/login.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('register')
  create(@Body() dto: CreateAccountDto) {
    return this.accountService.create(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.accountService.login(dto);
  }
}
