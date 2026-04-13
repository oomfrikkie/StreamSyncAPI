import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { DataSource } from 'typeorm';

describe('Invitation (e2e)', () => {
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

  const cleanupInvitations = async (accountIds: number[]) => {
    if (!accountIds.length) return;
    await dataSource.query(
      'DELETE FROM "invitation" WHERE inviter_account_id = ANY($1::int[]) OR invitee_account_id = ANY($1::int[])',
      [accountIds],
    );
  };

  const registerAccount = async (email: string): Promise<number> => {
    const res = await request(app.getHttpServer()).post('/account/register')
      .send({ email, first_name: 'Test', last_name: 'User', password: 'strongpassword123' })
      .expect((r) => { if (r.status < 200 || r.status >= 300) throw new Error(`Register got ${r.status}`); });
    const top = res.body as Record<string, unknown>;
    const account = top['account'] as Record<string, unknown>;
    const id = (account?.['id'] ?? account?.['account_id']) as number;
    if (!id) throw new Error('No account id');
    return id;
  };

  describe('/invitations (POST)', () => {
    it('creates an invitation and accepts it', async () => {
      const inviterEmail = `e2e_inviter_${Date.now()}@example.com`;
      const inviteeEmail = `e2e_invitee_${Date.now()}@example.com`;
      await cleanupByEmail(inviterEmail);
      await cleanupByEmail(inviteeEmail);

      const inviterAccountId = await registerAccount(inviterEmail);
      const inviteeAccountId = await registerAccount(inviteeEmail);

      const createRes = await request(app.getHttpServer()).post('/invitations')
        .send({ inviterAccountId, inviteeAccountId })
        .expect(201);
      expect((createRes.body as Record<string, unknown>)['status']).toBe('PENDING');

      const rows: Array<{ invitation_id: number }> = await dataSource.query(
        'SELECT invitation_id FROM "invitation" WHERE inviter_account_id = $1 AND invitee_account_id = $2 ORDER BY invitation_id DESC LIMIT 1',
        [inviterAccountId, inviteeAccountId],
      );
      const invitationId = rows?.[0]?.invitation_id;
      if (!invitationId) throw new Error('Invitation not found in DB');

      const listRes = await request(app.getHttpServer()).get(`/invitations/account/${inviteeAccountId}`).expect(200);
      expect(Array.isArray(listRes.body)).toBe(true);

      const getRes = await request(app.getHttpServer()).get(`/invitations/${invitationId}`).expect(200);
      expect((getRes.body as Record<string, unknown>)['status']).toBe('PENDING');

      const acceptRes = await request(app.getHttpServer()).post(`/invitations/accept/${invitationId}`).expect(201);
      expect((acceptRes.body as Record<string, unknown>)['status']).toBe('ACCEPTED');

      await cleanupInvitations([inviterAccountId, inviteeAccountId]);
      await cleanupByEmail(inviterEmail);
      await cleanupByEmail(inviteeEmail);
    });

    it('rejects invalid payload', async () => {
      await request(app.getHttpServer()).post('/invitations')
        .send({ inviterAccountId: 'not-a-number', inviteeAccountId: null })
        .expect(400);
    });

    it('returns 404 when accepting a non-existent invitation', async () => {
      await request(app.getHttpServer()).post('/invitations/accept/99999999').expect(404);
    });

    it('returns 405 for DELETE /invitations', async () => {
      await request(app.getHttpServer()).delete('/invitations').expect(405);
    });
  });
});
