import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { DataSource } from 'typeorm';

describe('Season (e2e)', () => {
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

  const getOrCreateAgeCategoryId = async (): Promise<number> => {
    const rows: Array<{ age_category_id: number }> = await dataSource.query(
      'SELECT age_category_id FROM "age_category" ORDER BY age_category_id ASC LIMIT 1',
    );
    if (rows?.[0]?.age_category_id) return rows[0].age_category_id;
    const inserted: Array<{ age_category_id: number }> = await dataSource.query(
      'INSERT INTO "age_category"(name, guidelines_text) VALUES ($1, $2) RETURNING age_category_id',
      ['E2E', 'E2E'],
    );
    return inserted[0].age_category_id;
  };

  const getQualityId = async (): Promise<number> => {
    const rows: Array<{ quality_id: number }> = await dataSource.query(
      'SELECT quality_id FROM "quality" ORDER BY quality_id ASC LIMIT 1',
    );
    if (!rows?.[0]?.quality_id) throw new Error('No quality rows found');
    return rows[0].quality_id;
  };

  const getSeriesId = (body: unknown): number | undefined => {
    if (!body || typeof body !== 'object') return undefined;
    const top = body as Record<string, unknown>;
    if (typeof top['series_id'] === 'number') return top['series_id'];
    if (typeof top['id'] === 'number') return top['id'];
    return undefined;
  };

  describe('/seasons/:seasonId/episodes (GET)', () => {
    it('returns episodes for a season that has episodes', async () => {
      const ageCategoryId = await getOrCreateAgeCategoryId();
      const qualityId = await getQualityId();

      const seriesRes = await request(app.getHttpServer()).post('/series')
        .send({ name: `E2E Series ${Date.now()}` })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Create series got ${r.status}`); });

      const seriesId = getSeriesId(seriesRes.body);
      if (!seriesId) throw new Error('No series_id in response');

      const title = `E2E Episode ${Date.now()}`;
      await request(app.getHttpServer()).post('/episodes')
        .send({ series_id: seriesId, season_number: 1, episode_number: 1, title, description: 'E2E', age_category_id: ageCategoryId, quality_id: qualityId, duration_minutes: 42 })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Create episode got ${r.status}`); });

      const seasonRows: Array<{ season_id: number }> = await dataSource.query(
        'SELECT season_id FROM "season" WHERE series_id = $1 AND season_number = $2 ORDER BY season_id DESC LIMIT 1',
        [seriesId, 1],
      );
      const seasonId = seasonRows?.[0]?.season_id;
      if (!seasonId) throw new Error('Season not found in DB');

      const res = await request(app.getHttpServer()).get(`/seasons/${seasonId}/episodes`).expect(200);
      const episodes = res.body as Array<Record<string, unknown>>;
      expect(Array.isArray(episodes)).toBe(true);
      expect(episodes.length).toBeGreaterThan(0);
      expect(episodes[0]['title']).toBe(title);
    });

    it('returns empty array for a season with no episodes', async () => {
      const seriesRes = await request(app.getHttpServer()).post('/series')
        .send({ name: `E2E Empty Season ${Date.now()}` })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Create series got ${r.status}`); });

      const seriesId = getSeriesId(seriesRes.body);
      if (!seriesId) throw new Error('No series_id in response');

      const seasonRes = await request(app.getHttpServer()).post('/seasons')
        .send({ series_id: seriesId, season_number: 99 })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Create season got ${r.status}`); });

      const seasonId = (seasonRes.body as Record<string, unknown>)['season_id'] as number;
      if (!seasonId) throw new Error('No season_id in response');

      const res = await request(app.getHttpServer()).get(`/seasons/${seasonId}/episodes`).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect((res.body as unknown[]).length).toBe(0);
    });

    it('returns 405 for DELETE /seasons', async () => {
      await request(app.getHttpServer()).delete('/seasons').expect(405);
    });
  });
});
