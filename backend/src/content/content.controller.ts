import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
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

  @Get('')
  getAll() {
    return this.contentService.getAllContent();
  }

  @Get('by-id/:id')
  getById(@Param('id') id: string) {
    return this.contentService.getContentById(Number(id));
  }

  @ApiQuery({ name: 'ageCategoryId', required: true, type: Number })
  @Get('by-age')
  getByAge(@Query('ageCategoryId') ageCategoryId: string) {
    return this.contentService.getContentBasedOnAgeRating(
      Number(ageCategoryId)
    );
  }

  @Get('currently-watching/:profileId')
  async currentlyWatching(@Param('profileId') profileId: string) {
  return this.contentService.getCurrentlyWatching(Number(profileId));
  }

  @Get('personalised')
  getPersonalised(@Query('profileId') profileId: string) {
  return this.contentService.getPersonalisedContent(Number(profileId));
  }
}