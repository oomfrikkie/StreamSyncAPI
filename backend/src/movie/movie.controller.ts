import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './movie.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('movie')
@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  getAllMovies() {
    return this.movieService.getAllMovies();
  }

  @Get('by-id')
  getMovieById(@Query('id') id: number) {
    return this.movieService.getMovieById(id);
  }

  @Post()
  createMovie(@Body() dto: CreateMovieDto) {
    return this.movieService.createMovie(dto);
  }
}
