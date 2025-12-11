import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Save / pause viewing progress
  @Post('pause')
  async pause(
    @Body('profileId') profileId: number,
    @Body('contentId') contentId: number,
    @Body('episodeId') episodeId: number | null,
    @Body('lastPositionSeconds') lastPositionSeconds: number,
    @Body('watchedSeconds') watchedSeconds: number,
    @Body('completed') completed: boolean,
    @Body('autoContinuedNext') autoContinuedNext: boolean = false,
  ) {
    await this.contentService.saveViewingProgress(profileId, contentId, episodeId, lastPositionSeconds, watchedSeconds, completed, autoContinuedNext);
    return { message: 'Progress saved' };
  }

  // Resume viewing progress
  @Get('resume')
  async resume(
    @Query('profileId') profileId: number,
    @Query('contentId') contentId: number,
    @Query('episodeId') episodeId: number | null,
  ) {
    return this.contentService.getViewingProgress(profileId, contentId, episodeId);
  }

  // Get all content
  @Get()                        // ← GET /content
  async getAllContent() {
    return this.contentService.getAllContent();
  }

  // Get content by ID
  @Get(':id')                   // ← GET /content/5
  async getContentById(@Query('id') id: number) {
    return this.contentService.getContentById(id);
  }
}
