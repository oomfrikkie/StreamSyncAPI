
import { Controller, Get, Param, Post, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import { AddSeasonDto } from './dto-season/add-season.dto';
import { SeasonService } from './season.service';
import { SeasonResponseDto } from './dto-season/season-response.dto';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  // POST /seasons
  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: SeasonResponseDto })
  @Post()
  async addSeason(@Body() dto: AddSeasonDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.seasonService.addSeason(dto.series_id, dto.season_number);
    const dtoResult: SeasonResponseDto = {
      season_id: result.season_id,
      series_id: result.series_id,
      series_name: result.series_name,
      season_number: result.season_number,
    };
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('season', dtoResult));
    }
    return res.json(dtoResult);
  }

  // GET /seasons
  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: SeasonResponseDto, isArray: true })
  @Get()
  async getAllSeasons(@Req() req: Request, @Res() res: Response) {
    const result = await this.seasonService.getAllSeasons();
    const dtoArr: SeasonResponseDto[] = result.map((item: any) => ({
      season_id: item.season_id,
      series_id: item.series_id,
      series_name: item.series_name,
      season_number: item.season_number,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('seasons', { item: dtoArr }));
    }
    return res.json(dtoArr);
  }

  // GET /seasons/:seasonId/episodes
  @Get(':seasonId/episodes')
  getEpisodes(@Param('seasonId') seasonId: string) {
    return this.seasonService.getEpisodes(Number(seasonId));
  }
}
