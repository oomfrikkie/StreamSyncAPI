import { Controller, Post, Body, Get, Param, Req, Res } from '@nestjs/common';
import { ApiProduces, ApiOkResponse, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { AccountService } from './account.service';
import { AccountDto } from './dto-account/account.dto';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';
import { ForgotPasswordDto } from './dto-account/forgot-password.dto';
import { ResetPasswordDto } from './dto-account/reset-password.dto';
import { AccountTokenService } from './token/account-token.service';
import { ProfileService } from 'src/profile/profile.service';
import { AuthService } from '../auth/auth.service';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly tokenService: AccountTokenService,
    private readonly authService: AuthService,
  ) {}


  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/xml', 'application/json')
  @ApiBody({ type: CreateAccountDto, description: 'Register account', required: true })
  @ApiOkResponse({ type: AccountDto })
  @Post('register')
  async create(@Body() dto: CreateAccountDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.accountService.create(dto);
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('account', result.account));
    }
    return res.json(result);
  }

  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/xml', 'application/json')
  @ApiBody({ type: LoginDto, description: 'Login', required: true })
  @ApiOkResponse({ type: LoginDto })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const accountLogin = await this.accountService.login(dto);
    const dtoResult = Object.assign(new LoginDto(), {
      email: dto.email,
      password: dto.password
    });
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('login', dtoResult));
    }
    return res.json(dtoResult);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ForgotPasswordDto })
  @Get('verify/:token')
  async verify(@Param('token') token: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.tokenService.verifyToken({
      token,
      token_type: 'EMAIL_VERIFICATION',
    });
    const dtoResult = Object.assign(new ForgotPasswordDto(), result);
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('verify', dtoResult));
    }
    return res.json(dtoResult);
  }

  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/xml', 'application/json')
  @ApiBody({ type: ForgotPasswordDto, description: 'Forgot password', required: true })
  @ApiOkResponse({ type: ForgotPasswordDto })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.accountService.requestPasswordReset(dto);
    const dtoResult = Object.assign(new ForgotPasswordDto(), result);
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('forgotPassword', dtoResult));
    }
    return res.json(dtoResult);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ResetPasswordDto })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.accountService.resetPassword(dto);
    const dtoResult = Object.assign(new ResetPasswordDto(), result);
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('resetPassword', dtoResult));
    }
    return res.json(dtoResult);
  }


  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: AccountDto })
  @Get(':id')
  async getAccountById(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const data = await this.accountService.findById(Number(id));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('account', data));
    }
    return res.json(data);
  }

 

  @ApiProduces('application/json', 'application/xml')
  @ApiResponse({ status: 200, description: 'Profiles response' })
  @Get(':accountId/profiles')
  async getProfilesByAccount(@Param('accountId') accountId: string, @Req() req: Request, @Res() res: Response) {
    const data = await this.accountService.getProfilesByAccount(Number(accountId));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('profiles', { profile: data }));
    }
    return res.json(data);
  }

}
