import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Movie } from './movie.entity';
import { Content } from '../content/content.entity';
import { CreateMovieDto } from './movie.dto';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Content) private readonly contentRepo: Repository<Content>,
    private readonly dataSource: DataSource,
  ) {}

  async getAllMovies() {
    return this.dataSource.query(`
      SELECT m.movie_id, c.*
      FROM movie m
      JOIN content c ON m.content_id = c.content_id
      WHERE c.content_type = 'MOVIE'
    `);
  }

  async getMovieById(id: number) {
    const result = await this.dataSource.query(`
      SELECT m.movie_id, c.*
      FROM movie m
      JOIN content c ON m.content_id = c.content_id
      WHERE m.movie_id = $1
    `, [id]);
    if (!result[0]) throw new NotFoundException('Movie not found');
    return result[0];
  }

  async createMovie(dto: CreateMovieDto) {
    try {
      await this.dataSource.query(
        `SELECT create_movie($1, $2, $3, $4, $5)`,
        [
          dto.age_category_id,
          dto.title,
          dto.description,
          dto.quality_id,
          dto.duration_minutes,
        ]
      );
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new BadRequestException('Invalid ID: age_category_id or quality_id does not exist');
      }
      throw error;
    }
    const result = await this.dataSource.query(
      `SELECT m.movie_id, c.* FROM movie m JOIN content c ON m.content_id = c.content_id WHERE c.title = $1 ORDER BY m.movie_id DESC LIMIT 1`,
      [dto.title]
    );
    return result[0] || null;
  }
}
