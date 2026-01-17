import { Controller, Get, Query, Post, Body, Req, Res } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './movie.dto';
import { MovieResponseDto } from './movie-response.dto';
import { ApiTags, ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import * as js2xmlparser from 'js2xmlparser';
import type { Request, Response } from 'express';

@ApiTags('movie')
@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}


  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: MovieResponseDto, isArray: true })
  @Get()
  async getAllMovies(@Req() req: Request, @Res() res: Response) {
    const result = await this.movieService.getAllMovies();
    const dtoArr = result.map((item: any) => ({
      movie_id: item.movie_id,
      age_category_id: item.age_category_id,
      title: item.title,
      description: item.description,
      quality_id: item.quality_id,
      duration_minutes: item.duration_minutes,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('movies', { movie: dtoArr }));
    }
    return res.json(dtoArr);
  }


  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: MovieResponseDto })
  @Get('by-id')
  async getMovieById(@Query('id') id: number, @Req() req: Request, @Res() res: Response) {
    const result = await this.movieService.getMovieById(id);
    let dto;
    if (result) {
      dto = {
        movie_id: result.movie_id,
        age_category_id: result.age_category_id,
        title: result.title,
        description: result.description,
        quality_id: result.quality_id,
        duration_minutes: result.duration_minutes,
      };
    }
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('movie', dto));
    }
    return res.json(dto);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: MovieResponseDto })
  @Post()
  async createMovie(@Body() dto: CreateMovieDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.movieService.createMovie(dto);
    let dtoResult;
    if (result) {
      dtoResult = {
        movie_id: result.movie_id,
        age_category_id: result.age_category_id,
        title: result.title,
        description: result.description,
        quality_id: result.quality_id,
        duration_minutes: result.duration_minutes,
      };
    }
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('movie', dtoResult));
    }
    return res.json(dtoResult);
  }
}
