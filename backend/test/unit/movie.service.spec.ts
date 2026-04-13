import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MovieService } from 'src/movie/movie.service';
import { Movie } from 'src/movie/movie.entity';
import { Content } from 'src/content/content.entity';
import { DataSource } from 'typeorm';

const mockMovieRepo = () => ({});
const mockContentRepo = () => ({});
const mockDataSource = () => ({ query: jest.fn() });

describe('MovieService', () => {
  let service: MovieService;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: getRepositoryToken(Movie), useFactory: mockMovieRepo },
        { provide: getRepositoryToken(Content), useFactory: mockContentRepo },
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    service = module.get(MovieService);
    dataSource = module.get(DataSource);
  });

  describe('getAllMovies', () => {
    it('returns all movies', async () => {
      const movies = [{ movie_id: 1, title: 'Movie A' }];
      dataSource.query.mockResolvedValue(movies);

      const result = await service.getAllMovies();

      expect(result).toEqual(movies);
    });
  });

  describe('getMovieById', () => {
    it('returns a movie when found', async () => {
      dataSource.query.mockResolvedValue([{ movie_id: 1, title: 'Movie A' }]);

      const result = await service.getMovieById(1);

      expect(result.title).toBe('Movie A');
    });

    it('throws NotFoundException when movie does not exist', async () => {
      dataSource.query.mockResolvedValue([]);

      await expect(service.getMovieById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMovie', () => {
    it('creates a movie via stored procedure and returns it', async () => {
      const created = { movie_id: 2, title: 'New Movie' };
      dataSource.query
        .mockResolvedValueOnce(undefined)  // create_movie SP
        .mockResolvedValueOnce([created]); // SELECT after insert

      const result = await service.createMovie({
        age_category_id: 1,
        title: 'New Movie',
        description: 'desc',
        quality_id: 1,
        duration_minutes: 100,
      });

      expect(result).toEqual(created);
      expect(dataSource.query).toHaveBeenCalledTimes(2);
    });

    it('throws BadRequestException on foreign key violation', async () => {
      const fkError = Object.assign(new Error('FK violation'), { code: '23503' });
      dataSource.query.mockRejectedValueOnce(fkError);

      await expect(
        service.createMovie({ age_category_id: 999, title: 'X', description: '', quality_id: 999, duration_minutes: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
