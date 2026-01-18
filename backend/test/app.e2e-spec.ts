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

  describe('/account/login (POST)', () => {
    const cleanupAccountByEmail = async (email: string) => {
      await dataSource
        .createQueryBuilder()
        .delete()
        .from('account')
        .where('email = :email', { email })
        .execute();
    };

    it('logs in with valid credentials', async () => {
      const email = `e2e_login_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
      const password = 'strongpassword123';

      await cleanupAccountByEmail(email);

      const registerRes = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          first_name: 'Test',
          last_name: 'User',
          password,
        })
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

      const verificationToken = getVerificationTokenFromRegisterResponse(
        registerRes.body,
      );

      if (!verificationToken) {
        await cleanupAccountByEmail(email);
        throw new Error(
          `No verification_token returned by /account/register: ${JSON.stringify(registerRes.body)}`,
        );
      }

      await request(app.getHttpServer())
        .get(`/account/verify/${verificationToken}`)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup verify expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email, password })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected login to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);

      expect(res.body).toBeDefined();
      expect(typeof res.body).toBe('object');
      if (res.body && typeof res.body === 'object') {
        expect((res.body as Record<string, unknown>)['email']).toBe(email);
      }
    });

    it('rejects login with wrong password', async () => {
      const email = `e2e_login_wrong_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
      const password = 'strongpassword123';

      await cleanupAccountByEmail(email);

      await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          first_name: 'Test',
          last_name: 'User',
          password,
        })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup register expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await request(app.getHttpServer())
        .post('/account/login')
        .send({ email, password: 'wrongpassword' })
        .expect((r) => {
          if (r.status >= 200 && r.status < 300) {
            throw new Error(
              `Expected wrong-password login to fail, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);
    });

    it('rejects login for unknown email', async () => {
      await request(app.getHttpServer())
        .post('/account/login')
        .send({
          email: `e2e_unknown_${Date.now()}@example.com`,
          password: 'strongpassword123',
        })
        .expect((r) => {
          if (r.status >= 200 && r.status < 300) {
            throw new Error(
              `Expected unknown-email login to fail, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });
    });

    it('rejects invalid email format (DTO validation)', async () => {
      await request(app.getHttpServer())
        .post('/account/login')
        .send({ email: 'not-an-email', password: 'strongpassword123' })
        .expect(400);
    });
  });

  describe('/account/forgot-password (POST)', () => {
    const cleanupAccountByEmail = async (email: string) => {
      await dataSource
        .createQueryBuilder()
        .delete()
        .from('account')
        .where('email = :email', { email })
        .execute();
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

    it('creates a PASSWORD_RESET token for an existing email', async () => {
      const email = `e2e_forgot_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
      const password = 'strongpassword123';

      await cleanupAccountByEmail(email);

      const registerRes = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          first_name: 'Test',
          last_name: 'User',
          password,
        })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup register expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const accountId = getAccountIdFromRegisterResponse(registerRes.body);
      if (!accountId) {
        await cleanupAccountByEmail(email);
        throw new Error(
          `Could not determine created account id from /account/register response: ${JSON.stringify(registerRes.body)}`,
        );
      }

      await request(app.getHttpServer())
        .post('/account/forgot-password')
        .send({ email })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected forgot-password to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const tokenRows: Array<{ token: string; is_used: boolean }> =
        await dataSource.query(
          'SELECT token, is_used FROM "account_token" WHERE account_id = $1 AND token_type = $2 ORDER BY token_id DESC LIMIT 1',
          [accountId, 'PASSWORD_RESET'],
        );

      await cleanupAccountByEmail(email);

      expect(tokenRows.length).toBeGreaterThan(0);
      expect(typeof tokenRows[0]?.token).toBe('string');
      expect(tokenRows[0]?.token.length).toBeGreaterThan(0);
      expect(tokenRows[0]?.is_used).toBe(false);
    });

    it('rejects invalid email format (DTO validation)', async () => {
      await request(app.getHttpServer())
        .post('/account/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('handles unknown email without server error', async () => {
      await request(app.getHttpServer())
        .post('/account/forgot-password')
        .send({ email: `e2e_unknown_forgot_${Date.now()}@example.com` })
        .expect((r) => {
          if (r.status === 500) {
            throw new Error(
              `Expected unknown-email forgot-password not to 500, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });
    });
  });
});
