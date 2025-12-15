import { Controller, Get } from '@nestjs/common';
import { EpisodeService } from './episode.service';

@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  async getAll() {
    return this.episodeService.getAllEpisodes();
  }
}
