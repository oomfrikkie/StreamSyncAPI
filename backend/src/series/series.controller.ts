import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SeriesService } from './series.service';
import { AddSeriesDto } from './dto-series/add-series.dto';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  getAllSeries() {
    return this.seriesService.getAllSeries();
  }

  @Get(':seriesId')
  getSeriesById(@Param('seriesId') seriesId: string) {
    return this.seriesService.getSeriesById(Number(seriesId));
  }

  @Get(':seriesId/episodes')
  getEpisodesBySeries(@Param('seriesId') seriesId: string) {
    return this.seriesService.getEpisodesBySeriesId(Number(seriesId));
  }

  @Post()
  addSeries(@Body() dto: AddSeriesDto) {
    return this.seriesService.addSeries(dto);
  }
}
