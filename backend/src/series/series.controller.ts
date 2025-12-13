import { Controller, Get, Param, Query } from '@nestjs/common';
import { SeriesService } from './series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  getAllSeries() {
    return this.seriesService.getAllSeries();
  }

  @Get(":seriesId")
  getSeriesById(@Param("seriesId") seriesId: string) {
    return this.seriesService.getSeriesById(Number(seriesId));
  }
  
  @Get(':seriesId/episodes')
  getEpisodes(
    @Param('seriesId') seriesId: number,
    @Query('profileId') profileId: number,
  ) {
    return this.seriesService.getEpisodesBySeriesId(
      profileId,
      seriesId,
    );
  }


}
