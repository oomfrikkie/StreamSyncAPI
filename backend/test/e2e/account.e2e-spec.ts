import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { DataSource } from 'typeorm';

describe('Account (e2e)', () => {
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

  const getAccountId = (body: unknown): number | undefined => {
    if (!body || typeof body !== 'object') return undefined;
    const top = body as Record<string, unknown>;
    const account = top['account'];
    if (!account || typeof account !== 'object') return undefined;
    const nested = account as Record<string, unknown>;
    if (typeof nested['id'] === 'number') return nested['id'];
    if (typeof nested['account_id'] === 'number') return nested['account_id'];
    return undefined;
  };

  // ── Register ────────────────────────────────────────────────────────────────

  describe('/account/register (POST)', () => {
    it('registers a new account with valid payload', async () => {
      const email = `e2e_reg_${Date.now()}@example.com`;
      await cleanupByEmail(email);
      const res = await request(app.getHttpServer())
        .post('/account/register')
        .send({ email, first_name: 'Test', last_name: 'User', password: 'strongpassword123' })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Got ${r.status}: ${JSON.stringify(r.body)}`); });
      await cleanupByEmail(email);
      expect(res.body).toBeDefined();
    });

    it('rejects invalid email', async () => {
      await request(app.getHttpServer())
        .post('/account/register')
        .send({ email: 'not-an-email', first_name: 'T', last_name: 'U', password: 'strongpassword123' })
        .expect(400);
    });

    it('rejects short password', async () => {
      await request(app.getHttpServer())
        .post('/account/register')
        .send({ email: `e2e_${Date.now()}@example.com`, first_name: 'T', last_name: 'U', password: '123' })
        .expect(400);
    });

    it('rejects duplicate email', async () => {
      const email = `e2e_dup_${Date.now()}@example.com`;
      await cleanupByEmail(email);
      const payload = { email, first_name: 'T', last_name: 'U', password: 'strongpassword123' };
      await request(app.getHttpServer()).post('/account/register').send(payload).expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`First register got ${r.status}`); });
      await request(app.getHttpServer()).post('/account/register').send(payload).expect((r) => { if (r.status >= 200 && r.status < 300) throw new Error(`Duplicate should fail, got ${r.status}`); });
      await cleanupByEmail(email);
    });

    it('returns 405 for GET /account/register', async () => {
      await request(app.getHttpServer()).get('/account/register').expect(405);
    });
  });

  // ── Verify ───────────────────────────────────────────────────────────────────

  describe('/account/verify/:token (GET)', () => {
    it('verifies a valid EMAIL_VERIFICATION token', async () => {
      const email = `e2e_verify_${Date.now()}@example.com`;
      await cleanupByEmail(email);
      const registerRes = await request(app.getHttpServer())
        .post('/account/register')
        .send({ email, first_name: 'T', last_name: 'U', password: 'strongpassword123' })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Register got ${r.status}`); });

      let token: string | undefined;
      const accountId = getAccountId(registerRes.body);
      if (accountId) {
        const rows: Array<{ token: string }> = await dataSource.query(
          'SELECT token FROM "account_token" WHERE account_id = $1 AND token_type = $2 ORDER BY token_id DESC LIMIT 1',
          [accountId, 'EMAIL_VERIFICATION'],
        );
        token = rows?.[0]?.token;
      }
      if (!token) { await cleanupByEmail(email); throw new Error('No EMAIL_VERIFICATION token found'); }

      const res = await request(app.getHttpServer()).get(`/account/verify/${token}`)
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Verify got ${r.status}`); });
      await cleanupByEmail(email);
      expect(res.body).toBeDefined();
    });

    it('rejects an invalid token', async () => {
      await request(app.getHttpServer()).get('/account/verify/not-a-real-token')
        .expect((r) => { if (r.status >= 200 && r.status < 300) throw new Error(`Should fail, got ${r.status}`); });
    });
  });

  // ── Login ────────────────────────────────────────────────────────────────────

  describe('/account/login (POST)', () => {
    it('rejects wrong password', async () => {
      const email = `e2e_login_${Date.now()}@example.com`;
      await cleanupByEmail(email);
      await request(app.getHttpServer()).post('/account/register').send({ email, first_name: 'T', last_name: 'U', password: 'strongpassword123' })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Register got ${r.status}`); });
      await request(app.getHttpServer()).post('/account/login').send({ email, password: 'wrongpassword' })
        .expect((r) => { if (r.status >= 200 && r.status < 300) throw new Error(`Should fail, got ${r.status}`); });
      await cleanupByEmail(email);
    });

    it('rejects unknown email', async () => {
      await request(app.getHttpServer()).post('/account/login')
        .send({ email: `unknown_${Date.now()}@example.com`, password: 'strongpassword123' })
        .expect((r) => { if (r.status >= 200 && r.status < 300) throw new Error(`Should fail, got ${r.status}`); });
    });

    it('rejects invalid email format', async () => {
      await request(app.getHttpServer()).post('/account/login')
        .send({ email: 'not-an-email', password: 'strongpassword123' })
        .expect(400);
    });

    it('returns 405 for GET /account/login', async () => {
      await request(app.getHttpServer()).get('/account/login').expect(405);
    });
  });

  // ── Forgot / Reset password ──────────────────────────────────────────────────

  describe('/account/forgot-password (POST)', () => {
    it('creates a PASSWORD_RESET token for an existing account', async () => {
      const email = `e2e_forgot_${Date.now()}@example.com`;
      await cleanupByEmail(email);
      const registerRes = await request(app.getHttpServer()).post('/account/register')
        .send({ email, first_name: 'T', last_name: 'U', password: 'strongpassword123' })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Register got ${r.status}`); });
      const accountId = getAccountId(registerRes.body);
      if (!accountId) { await cleanupByEmail(email); throw new Error('No account id'); }
      await request(app.getHttpServer()).post('/account/forgot-password').send({ email })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Forgot-password got ${r.status}`); });
      const rows: Array<{ token: string; is_used: boolean }> = await dataSource.query(
        'SELECT token, is_used FROM "account_token" WHERE account_id = $1 AND token_type = $2 ORDER BY token_id DESC LIMIT 1',
        [accountId, 'PASSWORD_RESET'],
      );
      await cleanupByEmail(email);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]?.is_used).toBe(false);
    });

    it('rejects invalid email format', async () => {
      await request(app.getHttpServer()).post('/account/forgot-password').send({ email: 'not-an-email' }).expect(400);
    });

    it('returns 405 for GET /account/forgot-password', async () => {
      await request(app.getHttpServer()).get('/account/forgot-password').expect(405);
    });
  });

  describe('/account/reset-password (POST)', () => {
    it('rejects invalid reset token', async () => {
      await request(app.getHttpServer()).post('/account/reset-password')
        .send({ token: 'not-a-real-token', new_password: 'newstrongpassword123' })
        .expect((r) => { if (r.status >= 200 && r.status < 300) throw new Error(`Should fail, got ${r.status}`); });
    });

    it('rejects short new_password', async () => {
      await request(app.getHttpServer()).post('/account/reset-password')
        .send({ token: 'any', new_password: '123' })
        .expect(400);
    });

    it('returns 405 for GET /account/reset-password', async () => {
      await request(app.getHttpServer()).get('/account/reset-password').expect(405);
    });
  });

  // ── Get account by id ─────────────────────────────────────────────────────────

  describe('/account/:id (GET)', () => {
    it('returns account for existing id', async () => {
      const email = `e2e_get_${Date.now()}@example.com`;
      await cleanupByEmail(email);
      const registerRes = await request(app.getHttpServer()).post('/account/register')
        .send({ email, first_name: 'T', last_name: 'U', password: 'strongpassword123' })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Register got ${r.status}`); });
      const accountId = getAccountId(registerRes.body);
      if (!accountId) { await cleanupByEmail(email); throw new Error('No account id'); }
      const res = await request(app.getHttpServer()).get(`/account/${accountId}`)
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Get account got ${r.status}`); });
      await cleanupByEmail(email);
      expect((res.body as Record<string, unknown>)['email']).toBe(email);
    });

    it('returns non-2xx for non-existent id', async () => {
      await request(app.getHttpServer()).get('/account/99999999')
        .expect((r) => { if (r.status >= 200 && r.status < 300) throw new Error(`Should fail, got ${r.status}`); });
    });

    it('returns 400 for non-numeric id', async () => {
      await request(app.getHttpServer()).get('/account/not-a-number').expect(400);
    });
  });

  // ── Get profiles by account ───────────────────────────────────────────────────

  describe('/account/:accountId/profiles (GET)', () => {
    it('returns empty array when account has no profiles', async () => {
      const email = `e2e_profiles_${Date.now()}@example.com`;
      await cleanupByEmail(email);
      const registerRes = await request(app.getHttpServer()).post('/account/register')
        .send({ email, first_name: 'T', last_name: 'U', password: 'strongpassword123' })
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Register got ${r.status}`); });
      const accountId = getAccountId(registerRes.body);
      if (!accountId) { await cleanupByEmail(email); throw new Error('No account id'); }
      const res = await request(app.getHttpServer()).get(`/account/${accountId}/profiles`)
        .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Get profiles got ${r.status}`); });
      await cleanupByEmail(email);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
