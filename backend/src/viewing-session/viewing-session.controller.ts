import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ViewingSessionService } from './viewing-session.service';
import { PlayViewingSessionDto } from './dto-viewing-session/play.dto';
import { PauseViewingSessionDto } from './dto-viewing-session/pause.dto';

@Controller('viewing-session')
export class ViewingSessionController {
  constructor(private readonly viewingSessionService: ViewingSessionService) {}

  @Post('play')
  play(@Body() dto: PlayViewingSessionDto) {
    return this.viewingSessionService.startViewingSession(dto);
  }

  @Post('pause')
  pause(@Body() dto: PauseViewingSessionDto) {
    return this.viewingSessionService.saveViewingProgress(dto);
  }

  @Get('currently-watching/:profileId')
  getCurrentlyWatching(@Param('profileId') profileId: string) {
    return this.viewingSessionService.getCurrentlyWatching(Number(profileId));
  }

  @Get(':profileId/:contentId')
  getViewingProgress(
    @Param('profileId') profileId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.viewingSessionService.getViewingProgress(Number(profileId), Number(contentId));
  }
}
