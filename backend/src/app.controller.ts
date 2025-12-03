import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  home() {
    return 'NestJS + Postgres is working!';
  }

  @Get('members')
  getMembers() {
    return this.appService.getMembers();
  }

  @Get('qualities')
  getQualities() {
    return this.appService.getQualities();
  }

  @Get('api-user-accounts')
  getApiUserAccounts() {
    return this.appService.getApiUserAccounts();
  }

  @Get('accounts')
  getAccounts() {
    return this.appService.getAccounts();
  }

  @Get('account-subscriptions')
  getAccountSubscriptions() {
    return this.appService.getAccountSubscriptions();
  }

  @Get('invitations')
  getInvitations() {
    return this.appService.getInvitations();
  }

  @Get('profiles')
  getProfiles() {
    return this.appService.getProfiles();
  }

  @Get('age-categories')
  getAgeCategories() {
    return this.appService.getAgeCategories();
  }

  @Get('profile-genre-preferences')
  getProfileGenrePreferences() {
    return this.appService.getProfileGenrePreferences();
  }

  @Get('genres')
  getGenres() {
    return this.appService.getGenres();
  }
}
