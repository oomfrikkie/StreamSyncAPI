import { Controller, Get, Param } from '@nestjs/common';
import { EpisodeService } from './episode.service';

@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  async getAll() {
    return this.episodeService.getAllEpisodes();
  }

  @Get('by-series/:seriesId')
  async getBySeries(@Param('seriesId') seriesId: string) {
    return this.episodeService.getEpisodesBySeries(Number(seriesId));
  }
}
