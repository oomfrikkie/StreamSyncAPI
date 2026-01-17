import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import { EpisodeService } from './episode.service';
import { CreateEpisodeDto } from './dto-episode/create-episode.dto';
import { EpisodeResponseDto } from './dto-episode/episode-response.dto';

@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: EpisodeResponseDto, isArray: true })
  @Get()
  async getAll(@Req() req: Request, @Res() res: Response) {
    const result = await this.episodeService.getAllEpisodes();
    const dtoArr: EpisodeResponseDto[] = result.map((item: any) => ({
      episode_id: item.episode_id,
      content_id: item.content_id,
      title: item.title,
      duration_minutes: item.duration_minutes,
      episode_number: item.episode_number,
      season_number: item.season_number,
      series_name: item.series_name,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('episodes', { episode: dtoArr }));
    }
    return res.json(dtoArr);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: EpisodeResponseDto })
  @Post()
  async create(@Body() dto: CreateEpisodeDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.episodeService.createEpisode(dto);
    const dtoResult: EpisodeResponseDto | null = result
      ? {
          episode_id: result.episode_id,
          content_id: result.content_id,
          title: result.title,
          duration_minutes: result.duration_minutes,
          episode_number: result.episode_number,
          // season_number and series_name are not available in the returned row, so omit for POST
        }
      : null;
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('episode', dtoResult));
    }
    return res.json(dtoResult);
  }
}
