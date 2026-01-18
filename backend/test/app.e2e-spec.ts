import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    dataSource = app.get(DataSource);
    await app.init();

    await dataSource.query(
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "first_name" VARCHAR(100)',
    );
    await dataSource.query(
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "last_name" VARCHAR(100)',
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  describe('/account/register (POST)', () => {
    const cleanupAccountByEmail = async (email: string) => {
      await dataSource
        .createQueryBuilder()
        .delete()
        .from('account')
        .where('email = :email', { email })
        .execute();
    };

    it('registers a new account with valid payload', async () => {
      const email = `e2e_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

      await cleanupAccountByEmail(email);

      const payload = {
        email,
        first_name: 'Test',
        last_name: 'User',
        password: 'strongpassword123',
      };

      const res = await request(app.getHttpServer())
        .post('/account/register')
        .send(payload)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);

      expect(res.body).toBeDefined();
      expect(typeof res.body).toBe('object');
    });

    it('rejects invalid email (DTO validation)', async () => {
      const payload = {
        email: 'not-an-email',
        first_name: 'Test',
        last_name: 'User',
        password: 'strongpassword123',
      };

      await request(app.getHttpServer())
        .post('/account/register')
        .send(payload)
        .expect(400);
    });

    it('rejects short password (DTO validation)', async () => {
      const payload = {
        email: `e2e_${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        password: '123',
      };

      await request(app.getHttpServer())
        .post('/account/register')
        .send(payload)
        .expect(400);
    });

    it('does not allow duplicate emails', async () => {
      const email = `e2e_dup_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

      await cleanupAccountByEmail(email);

      const payload = {
        email,
        first_name: 'Test',
        last_name: 'User',
        password: 'strongpassword123',
      };

      await request(app.getHttpServer())
        .post('/account/register')
        .send(payload)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup register expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await request(app.getHttpServer())
        .post('/account/register')
        .send(payload)
        .expect((r) => {
          if (r.status >= 200 && r.status < 300) {
            throw new Error(
              `Expected duplicate register to fail, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);
    });
  });

  describe('/account/verify/:token (GET)', () => {
    const cleanupAccountByEmail = async (email: string) => {
      await dataSource
        .createQueryBuilder()
        .delete()
        .from('account')
        .where('email = :email', { email })
        .execute();
    };

    it('verifies a valid EMAIL_VERIFICATION token', async () => {
      const email = `e2e_verify_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

      await cleanupAccountByEmail(email);

      const registerPayload = {
        email,
        first_name: 'Test',
        last_name: 'User',
        password: 'strongpassword123',
      };

      const registerRes = await request(app.getHttpServer())
        .post('/account/register')
        .send(registerPayload)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup register expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const getVerificationTokenFromRegisterResponse = (
        body: unknown,
      ): string | undefined => {
        if (!body || typeof body !== 'object') return undefined;
        const topLevel = body as Record<string, unknown>;
        const token = topLevel['verification_token'];
        if (typeof token === 'string' && token.length > 0) return token;
        return undefined;
      };

      const getAccountIdFromRegisterResponse = (
        body: unknown,
      ): number | undefined => {
        if (!body || typeof body !== 'object') return undefined;
        const topLevel = body as Record<string, unknown>;

        const account = topLevel['account'];
        if (!account || typeof account !== 'object') return undefined;
        const nested = account as Record<string, unknown>;

        const id = nested['id'];
        if (typeof id === 'number') return id;

        const accountId = nested['account_id'];
        if (typeof accountId === 'number') return accountId;

        return undefined;
      };

      let token = getVerificationTokenFromRegisterResponse(registerRes.body);

      if (!token) {
        const accountId = getAccountIdFromRegisterResponse(registerRes.body);
        if (accountId) {
          const tokenRows: Array<{ token: string }> = await dataSource.query(
            'SELECT token FROM "account_token" WHERE account_id = $1 AND token_type = $2 ORDER BY token_id DESC LIMIT 1',
            [accountId, 'EMAIL_VERIFICATION'],
          );
          token = tokenRows?.[0]?.token;
        }
      }

      if (!token) {
        await cleanupAccountByEmail(email);
        throw new Error(
          'No EMAIL_VERIFICATION token found for created account',
        );
      }

      const res = await request(app.getHttpServer())
        .get(`/account/verify/${token}`)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected verify to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);

      expect(res.body).toBeDefined();
      expect(typeof res.body).toBe('object');
    });

    it('rejects an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/account/verify/not-a-real-token')
        .expect((r) => {
          if (r.status >= 200 && r.status < 300) {
            throw new Error(
              `Expected invalid token to fail, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });
    });
  });
});
