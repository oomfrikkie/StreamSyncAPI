import { Controller, Get, Param, Post, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import { SeriesService } from './series.service';
import { AddSeriesDto } from './dto-series/add-series.dto';
import { SeriesResponseDto } from './dto-series/series-response.dto';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: SeriesResponseDto, isArray: true })
  @Get()
  async getAllSeries(@Req() req: Request, @Res() res: Response) {
    const result = await this.seriesService.getAllSeries();
    const dtoArr: SeriesResponseDto[] = result.map((item: any) => ({
      series_id: item.series_id,
      name: item.name,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('series', { item: dtoArr }));
    }
    return res.json(dtoArr);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: SeriesResponseDto })
  @Get(':seriesId')
  async getSeriesById(@Param('seriesId') seriesId: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.seriesService.getSeriesById(Number(seriesId));
    const dto: SeriesResponseDto = {
      series_id: result.series_id,
      name: result.name,
    };
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('series', dto));
    }
    return res.json(dto);
  }

  @Get(':seriesId/episodes')
  getEpisodesBySeries(@Param('seriesId') seriesId: string) {
    return this.seriesService.getEpisodesBySeriesId(Number(seriesId));
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: SeriesResponseDto })
  @Post()
  async addSeries(@Body() dto: AddSeriesDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.seriesService.addSeries(dto);
    const dtoResult: SeriesResponseDto = {
      series_id: result.series_id,
      name: result.name,
    };
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('series', dtoResult));
    }
    return res.json(dtoResult);
  }
}
