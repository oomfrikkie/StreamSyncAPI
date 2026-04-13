import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { DataSource } from 'typeorm';

describe('ViewingSession (e2e)', () => {
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

  const cleanupByEmail = async (email: string) => {
    await dataSource.createQueryBuilder().delete().from('account').where('email = :email', { email }).execute();
  };

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

  describe('/viewing-session (POST)', () => {
    it('rejects invalid profileId/contentId', async () => {
      await request(app.getHttpServer())
        .post('/viewing-session')
        .send({ profileId: 0, contentId: 0 })
        .expect(400);
    });

    it('starts a viewing session (idempotent)', async () => {
      const email = `e2e_vs_${Date.now()}@example.com`;
      await cleanupByEmail(email);

      const registerRes = await request(app.getHttpServer()).post('/account/register')
        .send({ email, first_name: 'T', last_name: 'U', password: 'strongpassword123' })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Register got ${r.status}`); });

      const top = registerRes.body as Record<string, unknown>;
      const account = top['account'] as Record<string, unknown>;
      const accountId = (account?.['id'] ?? account?.['account_id']) as number;
      if (!accountId) { await cleanupByEmail(email); throw new Error('No account id'); }

      const ageCategoryId = await getOrCreateAgeCategoryId();
      const qualityId = await getQualityId();

      const contentRows: Array<{ content_id: number }> = await dataSource.query(
        'INSERT INTO "content"(age_category_id, title, description, content_type, quality_id, duration_minutes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING content_id',
        [ageCategoryId, `E2E VS ${Date.now()}`, 'E2E', 'MOVIE', qualityId, 90],
      );
      const contentId = contentRows[0].content_id;

      const profileRows: Array<{ profile_id: number }> = await dataSource.query(
        'INSERT INTO "profile"(account_id, age_category_id, name, image_url, min_quality_id) VALUES ($1,$2,$3,$4,$5) RETURNING profile_id',
        [accountId, ageCategoryId, `E2E VS Profile ${Date.now()}`, null, qualityId],
      );
      const profileId = profileRows[0].profile_id;

      const res1 = await request(app.getHttpServer())
        .post('/viewing-session')
        .send({ profileId, contentId })
        .expect(201);

      const session = res1.body as Record<string, unknown>;
      expect(session['profile_id']).toBe(profileId);
      expect(session['content_id']).toBe(contentId);

      await request(app.getHttpServer()).post('/viewing-session').send({ profileId, contentId }).expect(201);

      const countRows: Array<{ count: string }> = await dataSource.query(
        'SELECT COUNT(*)::text AS count FROM "viewing_session" WHERE profile_id = $1 AND content_id = $2',
        [profileId, contentId],
      );
      expect(Number(countRows[0].count)).toBe(1);

      await dataSource.query('DELETE FROM "content" WHERE content_id = $1', [contentId]);
      await cleanupByEmail(email);
    });

    it('returns 405 for DELETE /viewing-session', async () => {
      await request(app.getHttpServer()).delete('/viewing-session').expect(405);
    });
  });
});
