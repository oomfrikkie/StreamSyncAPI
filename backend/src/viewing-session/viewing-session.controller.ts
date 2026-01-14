import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ViewingSessionService } from './viewing-session.service';
import { PlayContentDto } from '../content/dto-content/play.dto';
import { PauseContentDto } from '../content/dto-content/pause.dto';

@Controller('viewing-session')
export class ViewingSessionController {
  constructor(private readonly viewingSessionService: ViewingSessionService) {}

  @Post('play')
  play(@Body() dto: PlayContentDto) {
    return this.viewingSessionService.startViewingSession(dto);
  }

  @Post('pause')
  pause(@Body() dto: PauseContentDto) {
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
