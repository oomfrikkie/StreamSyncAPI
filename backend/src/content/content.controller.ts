import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { ContentService } from './content.service';
import { PlayContentDto } from './dto-content/play.dto';
import { PauseContentDto } from './dto-content/pause.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('play')
  async play(@Body() dto: PlayContentDto) {
    return this.contentService.startViewingSession(dto);
  }

  @Post('pause')
  async pause(@Body() dto: PauseContentDto) {
    await this.contentService.saveViewingProgress(dto);
    return { message: 'Progress saved' };
  }

  @Get('resume')
  async resume(
    @Query('profileId') profileId: string,
    @Query('contentId') contentId: string,
  ) {
    return this.contentService.getViewingProgress(
      Number(profileId),
      Number(contentId),
    );
  }

  @Get('all')
  getAll() {
    return this.contentService.getAllContent();
  }

  @Get('by-id/:id')
  getById(@Param('id') id: string) {
    return this.contentService.getContentById(Number(id));
  }

  @Get('by-age/:ageCategoryId')
  getByAge(@Param('ageCategoryId') ageCategoryId: string) {
    return this.contentService.getContentBasedOnAgeRating(
      Number(ageCategoryId)
    );
  }
}
