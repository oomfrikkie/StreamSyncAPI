import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

@Get()
home() {
  const members = this.appService.getMembers();
  return `${members} NestJS + Postgres is working!`;
}



  @Get('members')
  getMembers() {
    return this.appService.getMembers();
  }

  @Get('qualities')
  getQualities() {
    return this.appService.getQualities();
  }
}
