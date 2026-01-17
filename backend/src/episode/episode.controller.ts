import { Controller, Get, Post, Body } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { CreateEpisodeDto } from './dto-episode/create-episode.dto';

@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  async getAll() {
    return this.episodeService.getAllEpisodes();
  }

  @Post()
  async create(@Body() dto: CreateEpisodeDto) {
    return this.episodeService.createEpisode(dto);
  }
}
