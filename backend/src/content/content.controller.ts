import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Endpoint to save/pause viewing progress
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

  // Endpoint to resume viewing progress
  @Get('resume')
  async resume(
    @Query('profileId') profileId: number,
    @Query('contentId') contentId: number,
    @Query('episodeId') episodeId: number | null,
  ) {
    const progress = await this.contentService.getViewingProgress(profileId, contentId, episodeId);
    return progress;
  }

  // Endpoint to get all content
  @Get()
  async getAllContent() {
    return this.contentService.getAllContent();
  }

  // Endpoint to get content by ID
  @Get('by-id')
  async getContentById(@Query('contentId') contentId: number) {
    return this.contentService.getContentById(contentId);
  }
}
