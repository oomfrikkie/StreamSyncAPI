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

  describe('/account/reset-password (POST)', () => {
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

    const getVerificationTokenFromRegisterResponse = (
      body: unknown,
    ): string | undefined => {
      if (!body || typeof body !== 'object') return undefined;
      const topLevel = body as Record<string, unknown>;
      const token = topLevel['verification_token'];
      if (typeof token === 'string' && token.length > 0) return token;
      return undefined;
    };

    it('resets password with a valid PASSWORD_RESET token and marks token as used', async () => {
      const email = `e2e_reset_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
      const password = 'strongpassword123';
      const newPassword = 'newstrongpassword123';

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
      const verificationToken = getVerificationTokenFromRegisterResponse(
        registerRes.body,
      );

      if (!accountId || !verificationToken) {
        await cleanupAccountByEmail(email);
        throw new Error(
          `Missing accountId/verificationToken from /account/register response: ${JSON.stringify(registerRes.body)}`,
        );
      }

      await request(app.getHttpServer())
        .post('/account/forgot-password')
        .send({ email })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup forgot-password expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const tokenRows: Array<{
        token: string;
        token_id: number;
        is_used: boolean;
      }> = await dataSource.query(
        'SELECT token, token_id, is_used FROM "account_token" WHERE account_id = $1 AND token_type = $2 ORDER BY token_id DESC LIMIT 1',
        [accountId, 'PASSWORD_RESET'],
      );

      const resetToken = tokenRows?.[0]?.token;
      const resetTokenId = tokenRows?.[0]?.token_id;

      if (!resetToken || !resetTokenId) {
        await cleanupAccountByEmail(email);
        throw new Error('No PASSWORD_RESET token found for created account');
      }

      await request(app.getHttpServer())
        .post('/account/reset-password')
        .send({ token: resetToken, new_password: newPassword })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected reset-password to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const usedRows: Array<{ is_used: boolean }> = await dataSource.query(
        'SELECT is_used FROM "account_token" WHERE token_id = $1',
        [resetTokenId],
      );

      expect(usedRows?.[0]?.is_used).toBe(true);

      await request(app.getHttpServer())
        .get(`/account/verify/${verificationToken}`)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup verify expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await request(app.getHttpServer())
        .post('/account/login')
        .send({ email, password: newPassword })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected login with new password to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);
    });

    it('rejects invalid reset token', async () => {
      await request(app.getHttpServer())
        .post('/account/reset-password')
        .send({
          token: 'not-a-real-token',
          new_password: 'newstrongpassword123',
        })
        .expect((r) => {
          if (r.status >= 200 && r.status < 300) {
            throw new Error(
              `Expected invalid reset token to fail, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });
    });

    it('rejects reusing a PASSWORD_RESET token', async () => {
      const email = `e2e_reset_reuse_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
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
              `Setup forgot-password expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const tokenRows: Array<{ token: string }> = await dataSource.query(
        'SELECT token FROM "account_token" WHERE account_id = $1 AND token_type = $2 ORDER BY token_id DESC LIMIT 1',
        [accountId, 'PASSWORD_RESET'],
      );

      const resetToken = tokenRows?.[0]?.token;
      if (!resetToken) {
        await cleanupAccountByEmail(email);
        throw new Error('No PASSWORD_RESET token found for created account');
      }

      await request(app.getHttpServer())
        .post('/account/reset-password')
        .send({ token: resetToken, new_password: 'newstrongpassword123' })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected reset-password to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await request(app.getHttpServer())
        .post('/account/reset-password')
        .send({ token: resetToken, new_password: 'anothernewpassword123' })
        .expect((r) => {
          if (r.status >= 200 && r.status < 300) {
            throw new Error(
              `Expected reused reset token to fail, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);
    });

    it('rejects short new_password (DTO validation)', async () => {
      await request(app.getHttpServer())
        .post('/account/reset-password')
        .send({ token: 'not-a-real-token', new_password: '123' })
        .expect(400);
    });
  });

  describe('/account/:id (GET)', () => {
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

    it('returns account details for an existing account id', async () => {
      const email = `e2e_get_account_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

      await cleanupAccountByEmail(email);

      const registerRes = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          first_name: 'Test',
          last_name: 'User',
          password: 'strongpassword123',
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

      const res = await request(app.getHttpServer())
        .get(`/account/${accountId}`)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected get account to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
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

    it('returns non-2xx for a non-existent id', async () => {
      await request(app.getHttpServer())
        .get('/account/99999999')
        .expect((r) => {
          if (r.status >= 200 && r.status < 300) {
            throw new Error(
              `Expected non-existent account to fail, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });
    });

    it('returns 500 for non-numeric id (current behavior)', async () => {
      await request(app.getHttpServer())
        .get('/account/not-a-number')
        .expect(500);
    });
  });

  describe('/account/:accountId/profiles (GET)', () => {
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

    const getOrCreateAgeCategoryId = async (): Promise<number> => {
      const rows: Array<{ age_category_id: number }> = await dataSource.query(
        'SELECT age_category_id FROM "age_category" ORDER BY age_category_id ASC LIMIT 1',
      );
      if (rows?.[0]?.age_category_id) return rows[0].age_category_id;

      const inserted: Array<{ age_category_id: number }> =
        await dataSource.query(
          'INSERT INTO "age_category"(name, guidelines_text) VALUES ($1, $2) RETURNING age_category_id',
          ['E2E', 'E2E'],
        );
      return inserted[0].age_category_id;
    };

    const getQualityId = async (): Promise<number> => {
      const rows: Array<{ quality_id: number }> = await dataSource.query(
        'SELECT quality_id FROM "quality" ORDER BY quality_id ASC LIMIT 1',
      );
      if (!rows?.[0]?.quality_id) {
        throw new Error(
          'No quality rows found; expected seed data in quality table',
        );
      }
      return rows[0].quality_id;
    };

    it('returns profiles for an account that has profiles', async () => {
      const email = `e2e_profiles_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

      await cleanupAccountByEmail(email);

      const registerRes = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          first_name: 'Test',
          last_name: 'User',
          password: 'strongpassword123',
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

      const ageCategoryId = await getOrCreateAgeCategoryId();
      const qualityId = await getQualityId();
      const profileName = `E2E Profile ${Date.now()}`;

      await dataSource.query(
        'INSERT INTO "profile"(account_id, age_category_id, name, image_url, min_quality_id) VALUES ($1, $2, $3, $4, $5)',
        [accountId, ageCategoryId, profileName, null, qualityId],
      );

      const res = await request(app.getHttpServer())
        .get(`/account/${accountId}/profiles`)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected get profiles to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);

      const profiles = res.body as unknown;
      expect(Array.isArray(profiles)).toBe(true);
      const profileArray = profiles as Array<Record<string, unknown>>;
      expect(profileArray.length).toBeGreaterThan(0);
      expect(profileArray[0]).toBeDefined();
      expect(profileArray[0]['account_id']).toBe(accountId);
      expect(profileArray[0]['name']).toBe(profileName);
    });

    it('returns an empty array when an account has no profiles', async () => {
      const email = `e2e_profiles_empty_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

      await cleanupAccountByEmail(email);

      const registerRes = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          first_name: 'Test',
          last_name: 'User',
          password: 'strongpassword123',
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

      const res = await request(app.getHttpServer())
        .get(`/account/${accountId}/profiles`)
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Expected get profiles to succeed, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      await cleanupAccountByEmail(email);

      const profiles = res.body as unknown;
      expect(Array.isArray(profiles)).toBe(true);
      const profileArray = profiles as Array<unknown>;
      expect(profileArray.length).toBe(0);
    });

    it('returns 500 for non-numeric accountId (current behavior)', async () => {
      await request(app.getHttpServer())
        .get('/account/not-a-number/profiles')
        .expect(500);
    });
  });

  describe('/viewing-session (POST)', () => {
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

    const getOrCreateAgeCategoryId = async (): Promise<number> => {
      const rows: Array<{ age_category_id: number }> = await dataSource.query(
        'SELECT age_category_id FROM "age_category" ORDER BY age_category_id ASC LIMIT 1',
      );
      if (rows?.[0]?.age_category_id) return rows[0].age_category_id;

      const inserted: Array<{ age_category_id: number }> =
        await dataSource.query(
          'INSERT INTO "age_category"(name, guidelines_text) VALUES ($1, $2) RETURNING age_category_id',
          ['E2E', 'E2E'],
        );
      return inserted[0].age_category_id;
    };

    const getQualityId = async (): Promise<number> => {
      const rows: Array<{ quality_id: number }> = await dataSource.query(
        'SELECT quality_id FROM "quality" ORDER BY quality_id ASC LIMIT 1',
      );
      if (!rows?.[0]?.quality_id) {
        throw new Error(
          'No quality rows found; expected seed data in quality table',
        );
      }
      return rows[0].quality_id;
    };

    const createContent = async (ageCategoryId: number, qualityId: number) => {
      const rows: Array<{ content_id: number }> = await dataSource.query(
        'INSERT INTO "content"(age_category_id, title, description, content_type, quality_id, duration_minutes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING content_id',
        [
          ageCategoryId,
          `E2E Content ${Date.now()}`,
          'E2E',
          'MOVIE',
          qualityId,
          90,
        ],
      );
      return rows[0].content_id;
    };

    it('starts a viewing session and is idempotent for the same (profileId, contentId)', async () => {
      const email = `e2e_vs_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

      await cleanupAccountByEmail(email);

      const registerRes = await request(app.getHttpServer())
        .post('/account/register')
        .send({
          email,
          first_name: 'Test',
          last_name: 'User',
          password: 'strongpassword123',
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

      const ageCategoryId = await getOrCreateAgeCategoryId();
      const qualityId = await getQualityId();
      const contentId = await createContent(ageCategoryId, qualityId);

      const profileRows: Array<{ profile_id: number }> = await dataSource.query(
        'INSERT INTO "profile"(account_id, age_category_id, name, image_url, min_quality_id) VALUES ($1, $2, $3, $4, $5) RETURNING profile_id',
        [
          accountId,
          ageCategoryId,
          `E2E VS Profile ${Date.now()}`,
          null,
          qualityId,
        ],
      );
      const profileId = profileRows[0].profile_id;

      const playRes1 = await request(app.getHttpServer())
        .post('/viewing-session')
        .send({ profileId, contentId })
        .expect(201);

      const session1 = playRes1.body as Record<string, unknown>;
      expect(session1['profile_id']).toBe(profileId);
      expect(session1['content_id']).toBe(contentId);

      await request(app.getHttpServer())
        .post('/viewing-session')
        .send({ profileId, contentId })
        .expect(201);

      const countRows: Array<{ count: string }> = await dataSource.query(
        'SELECT COUNT(*)::text AS count FROM "viewing_session" WHERE profile_id = $1 AND content_id = $2',
        [profileId, contentId],
      );
      expect(Number(countRows[0].count)).toBe(1);

      await dataSource.query('DELETE FROM "content" WHERE content_id = $1', [
        contentId,
      ]);
      await cleanupAccountByEmail(email);
    });

    it('rejects invalid profileId/contentId (DTO validation)', async () => {
      await request(app.getHttpServer())
        .post('/viewing-session')
        .send({ profileId: 0, contentId: 0 })
        .expect(400);
    });
  });

  describe('/seasons/:seasonId/episodes (GET)', () => {
    const getOrCreateAgeCategoryId = async (): Promise<number> => {
      const rows: Array<{ age_category_id: number }> = await dataSource.query(
        'SELECT age_category_id FROM "age_category" ORDER BY age_category_id ASC LIMIT 1',
      );
      if (rows?.[0]?.age_category_id) return rows[0].age_category_id;

      const inserted: Array<{ age_category_id: number }> =
        await dataSource.query(
          'INSERT INTO "age_category"(name, guidelines_text) VALUES ($1, $2) RETURNING age_category_id',
          ['E2E', 'E2E'],
        );
      return inserted[0].age_category_id;
    };

    const getQualityId = async (): Promise<number> => {
      const rows: Array<{ quality_id: number }> = await dataSource.query(
        'SELECT quality_id FROM "quality" ORDER BY quality_id ASC LIMIT 1',
      );
      if (!rows?.[0]?.quality_id) {
        throw new Error(
          'No quality rows found; expected seed data in quality table',
        );
      }
      return rows[0].quality_id;
    };

    const getSeriesIdFromSeriesResponse = (
      body: unknown,
    ): number | undefined => {
      if (!body || typeof body !== 'object') return undefined;
      const topLevel = body as Record<string, unknown>;
      const seriesId = topLevel['series_id'];
      if (typeof seriesId === 'number') return seriesId;
      const id = topLevel['id'];
      if (typeof id === 'number') return id;
      return undefined;
    };

    it('returns episodes for a season that has episodes', async () => {
      const ageCategoryId = await getOrCreateAgeCategoryId();
      const qualityId = await getQualityId();

      const seriesRes = await request(app.getHttpServer())
        .post('/series')
        .send({ name: `E2E Series ${Date.now()}` })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup series expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const seriesId = getSeriesIdFromSeriesResponse(seriesRes.body);
      if (!seriesId) {
        throw new Error(
          `Could not determine created series id from /series response: ${JSON.stringify(seriesRes.body)}`,
        );
      }

      const seasonNumber = 1;
      const episodeNumber = 1;
      const title = `E2E Episode ${Date.now()}`;

      await request(app.getHttpServer())
        .post('/episodes')
        .send({
          series_id: seriesId,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          title,
          description: 'E2E',
          age_category_id: ageCategoryId,
          quality_id: qualityId,
          duration_minutes: 42,
        })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup episode expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const seasonRows: Array<{ season_id: number }> = await dataSource.query(
        'SELECT season_id FROM "season" WHERE series_id = $1 AND season_number = $2 ORDER BY season_id DESC LIMIT 1',
        [seriesId, seasonNumber],
      );
      const seasonId = seasonRows?.[0]?.season_id;
      if (!seasonId) {
        throw new Error('Could not find created season_id in DB');
      }

      const res = await request(app.getHttpServer())
        .get(`/seasons/${seasonId}/episodes`)
        .expect(200);

      const episodes = res.body as unknown;
      expect(Array.isArray(episodes)).toBe(true);
      const episodeArray = episodes as Array<Record<string, unknown>>;
      expect(episodeArray.length).toBeGreaterThan(0);
      expect(episodeArray[0]['episode_number']).toBe(episodeNumber);
      expect(episodeArray[0]['title']).toBe(title);
    });

    it('returns empty array for a season with no episodes', async () => {
      const seriesRes = await request(app.getHttpServer())
        .post('/series')
        .send({ name: `E2E Empty Season Series ${Date.now()}` })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup series expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const seriesId = getSeriesIdFromSeriesResponse(seriesRes.body);
      if (!seriesId) {
        throw new Error(
          `Could not determine created series id from /series response: ${JSON.stringify(seriesRes.body)}`,
        );
      }

      const seasonRes = await request(app.getHttpServer())
        .post('/seasons')
        .send({ series_id: seriesId, season_number: 99 })
        .expect((r) => {
          if (r.status < 200 || r.status >= 300) {
            throw new Error(
              `Setup season expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`,
            );
          }
        });

      const seasonId = (seasonRes.body as Record<string, unknown>)[
        'season_id'
      ] as number | undefined;

      if (!seasonId || typeof seasonId !== 'number') {
        throw new Error(
          `Could not determine created season id from /seasons response: ${JSON.stringify(seasonRes.body)}`,
        );
      }

      const res = await request(app.getHttpServer())
        .get(`/seasons/${seasonId}/episodes`)
        .expect(200);

      const episodes = res.body as unknown;
      expect(Array.isArray(episodes)).toBe(true);
      const episodeArray = episodes as Array<unknown>;
      expect(episodeArray.length).toBe(0);
    });

    it('returns 500 for non-numeric seasonId (current behavior)', async () => {
      await request(app.getHttpServer())
        .get('/seasons/not-a-number/episodes')
        .expect(500);
    });
  });
});
