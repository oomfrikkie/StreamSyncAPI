import { Injectable } from '@nestjs/common';
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
    return result[0] || null;
  }

  async createMovie(dto: CreateMovieDto) {
    // Use stored procedure to create movie and content atomically
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
    // Optionally, return the newly created movie (fetch by title or other unique field)
    const result = await this.dataSource.query(
      `SELECT m.movie_id, c.* FROM movie m JOIN content c ON m.content_id = c.content_id WHERE c.title = $1 ORDER BY m.movie_id DESC LIMIT 1`,
      [dto.title]
    );
    return result[0] || null;
  }
}
