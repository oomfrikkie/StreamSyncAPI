import { Controller, Get, Param } from '@nestjs/common';
import { SeasonService } from './season.service';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('by-series/:seriesId')
  async getBySeries(@Param('seriesId') seriesId: string) {
    return this.seasonService.getSeasonsBySeries(Number(seriesId));
  }
}
