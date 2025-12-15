import { Controller, Get, Param } from '@nestjs/common';
import { SeasonService } from './season.service';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  // GET /seasons
  @Get()
  getAllSeasons() {
    return this.seasonService.getAllSeasons();
  }

  // GET /seasons/:seasonId/episodes
  @Get(':seasonId/episodes')
  getEpisodes(@Param('seasonId') seasonId: string) {
    return this.seasonService.getEpisodes(Number(seasonId));
  }
}
