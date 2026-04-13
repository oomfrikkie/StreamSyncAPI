import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { DataSource } from 'typeorm';

describe('Movie (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    dataSource = app.get(DataSource);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const getOrCreateAgeCategoryId = async (ds: DataSource): Promise<number> => {
    const rows: Array<{ age_category_id: number }> = await ds.query(
      'SELECT age_category_id FROM "age_category" ORDER BY age_category_id ASC LIMIT 1',
    );
    if (rows?.[0]?.age_category_id) return rows[0].age_category_id;
    const inserted: Array<{ age_category_id: number }> = await ds.query(
      'INSERT INTO "age_category"(name, guidelines_text) VALUES ($1, $2) RETURNING age_category_id',
      ['E2E', 'E2E'],
    );
    return inserted[0].age_category_id;
  };

  const getQualityId = async (ds: DataSource): Promise<number> => {
    const rows: Array<{ quality_id: number }> = await ds.query(
      'SELECT quality_id FROM "quality" ORDER BY quality_id ASC LIMIT 1',
    );
    if (!rows?.[0]?.quality_id) throw new Error('No quality rows found');
    return rows[0].quality_id;
  };

  describe('/movie (GET)', () => {
    it('returns an array of movies', async () => {
      const res = await request(app.getHttpServer()).get('/movie').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 405 for DELETE /movie', async () => {
      await request(app.getHttpServer()).delete('/movie').expect(405);
    });
  });

  describe('/movie/:id (GET)', () => {
    it('returns a movie by id', async () => {
      const ageCategoryId = await getOrCreateAgeCategoryId(dataSource);
      const qualityId = await getQualityId(dataSource);
      const title = `E2E Movie ${Date.now()}`;

      const createRes = await request(app.getHttpServer()).post('/movie')
        .send({ age_category_id: ageCategoryId, title, description: 'E2E', quality_id: qualityId, duration_minutes: 120 })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Create movie got ${r.status}: ${JSON.stringify(r.body)}`); });

      const movieId = (createRes.body as Record<string, unknown>)['movie_id'];
      if (typeof movieId !== 'number') throw new Error('No movie_id in response');

      const res = await request(app.getHttpServer()).get(`/movie/${movieId}`).expect(200);
      const movie = res.body as Record<string, unknown>;
      expect(movie['movie_id']).toBe(movieId);
      expect(movie['title']).toBe(title);
    });

    it('returns 405 for DELETE /movie/:id', async () => {
      await request(app.getHttpServer()).delete('/movie/1').expect(405);
    });
  });
});
