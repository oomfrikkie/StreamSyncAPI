
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { AddSeasonDto } from './dto-season/add-season.dto';
import { SeasonService } from './season.service';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  // POST /seasons
  @Post()
  addSeason(@Body() dto: AddSeasonDto) {
    return this.seasonService.addSeason(dto.series_id, dto.season_number);
  }

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
