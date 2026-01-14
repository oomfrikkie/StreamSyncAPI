import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { AccountController } from './../src/account/account.controller';
import { AccountService } from './../src/account/account.service';
import { AccountTokenService } from './../src/account/token/account-token.service';
import { ProfileController } from './../src/profile/profile.controller';
import { ProfileService } from './../src/profile/profile.service';
import { ContentController } from './../src/content/content.controller';
import { ContentService } from './../src/content/content.service';
import { DiscountController } from './../src/discount/discount.controller';
import { DiscountService } from './../src/discount/discount.service';
import { EpisodeController } from './../src/episode/episode.controller';
import { EpisodeService } from './../src/episode/episode.service';
import { SeriesController } from './../src/series/series.controller';
import { SeriesService } from './../src/series/series.service';
import { SeasonController } from './../src/season/season.controller';
import { SeasonService } from './../src/season/season.service';
import { InvitationController } from './../src/invitation/invitation.controller';
import { InvitationService } from './../src/invitation/invitation.service';
import { WatchlistController } from './../src/watchlist/watchlist.controller';
import { WatchlistService } from './../src/watchlist/watchlist.service';

describe('E2E: All controllers', () => {
  let app: INestApplication<App>;

  const mockAppService = {
    getMembers: () => ['member1'],
    getQualities: () => ['HD'],
    getApiUserAccounts: () => [],
    getAccounts: () => [],
    getAccountSubscriptions: () => [],
    getInvitations: () => [],
    getProfiles: () => [],
    getAgeCategories: () => [],
    getProfileGenrePreferences: () => [],
    getGenres: () => [],
  };

  const mockAccountService = {
    create: (dto: any) => ({ message: 'Account created', account_id: 1 }),
    login: (dto: any) => ({ message: 'Login successful', account_id: 1 }),
    requestPasswordReset: (dto: any) => ({ message: 'Password reset token created', reset_token: 'token', reset_link: '/account/reset-password/token' }),
    resetPassword: (dto: any) => ({ message: 'Password updated successfully' }),
    findById: (id: number) => ({ account_id: id, email: 'a@b.com' }),
    getProfilesByAccount: (accountId: number) => [{ profile_id: 1, name: 'Profile 1' }],
  };

  const mockAccountTokenService = {
    verifyToken: (dto: any) => ({ message: 'Email verified successfully' }),
    getTokenEntity: (token: string) => ({ token }),
  };

  const mockProfileService = {
    create: (dto: any) => ({ profile_id: 1, ...dto }),
    getAllProfiles: () => [{ profile_id: 1, name: 'Profile 1' }],
    delete: (id: number) => ({ affected: 1 }),
  };

  const mockContentService = {
    startViewingSession: (dto: any) => ({ session_id: 1, ...dto }),
    saveViewingProgress: (dto: any) => ({}),
    getViewingProgress: (p: number, c: number) => ({ last_position_seconds: 10, watched_seconds: 20, completed: false, auto_continued_next: false }),
    getCurrentlyWatching: (profileId: number) => [],
    getAllContent: () => [{ content_id: 1, title: 'Test' }],
    getContentById: (id: number) => ({ content_id: id, title: 'Test' }),
    getContentBasedOnAgeRating: (ageCatId: number) => [],
    getPersonalisedContent: (profileId: number) => [],
  };

  const mockDiscountService = {
    getActiveDiscountForAccount: (accountId: number) => ({ percentage: 20, validUntil: new Date('2099-01-01'), active: true }),
  };

  const mockEpisodeService = {
    getAllEpisodes: () => [{ episode_id: 1 }],
  };

  const mockSeriesService = {
    getAllSeries: () => [{ series_id: 1 }],
    getSeriesById: (id: number) => ({ series_id: id, name: 'Series' }),
    getEpisodesBySeriesId: (id: number) => [{ episode_id: 1 }],
  };

  const mockSeasonService = {
    getAllSeasons: () => [{ season_id: 1 }],
    getEpisodes: (id: number) => [{ episode_id: 1 }],
  };

  const mockInvitationService = {
    createInvitation: (inviterAccountId: number, inviteeAccountId: number) => ({ invitationId: 1, status: 'PENDING', discountExpiryDate: null }),
    acceptInvitation: (id: number) => ({ invitationId: id, status: 'ACCEPTED', discountExpiryDate: null }),
    getInvitationsForAccount: (id: number) => [],
    getInvitationById: (id: number) => ({ invitationId: id, status: 'PENDING' }),
  };

  const mockWatchlistService = {
    addToWatchList: (p: number, c: number) => ({ message: 'Added to watchlist' }),
    getWatchlistByProfile: (p: number) => [],
    removeFromWatchlist: (p: number, c: number) => ({ message: 'Removed from watchlist' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AppController,
        AccountController,
        ProfileController,
        ContentController,
        DiscountController,
        EpisodeController,
        SeriesController,
        SeasonController,
        InvitationController,
        WatchlistController,
      ],
      providers: [
        { provide: AppService, useValue: mockAppService },
        { provide: AccountService, useValue: mockAccountService },
        { provide: AccountTokenService, useValue: mockAccountTokenService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ContentService, useValue: mockContentService },
        { provide: DiscountService, useValue: mockDiscountService },
        { provide: EpisodeService, useValue: mockEpisodeService },
        { provide: SeriesService, useValue: mockSeriesService },
        { provide: SeasonService, useValue: mockSeasonService },
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: WatchlistService, useValue: mockWatchlistService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('NestJS + Postgres is working!');
  });

  it('GET /members', () => {
    return request(app.getHttpServer()).get('/members').expect(200).expect(['member1']);
  });

  // Account
  it('POST /account/register', () => {
    return request(app.getHttpServer())
      .post('/account/register')
      .send({ email: 'a@b.com', password: 'secret' })
      .expect(201)
      .expect({ message: 'Account created', account_id: 1 });
  });

  it('POST /account/login', () => {
    return request(app.getHttpServer())
      .post('/account/login')
      .send({ email: 'a@b.com', password: 'secret' })
      .expect(200)
      .expect({ message: 'Login successful', account_id: 1 });
  });

  it('GET /account/verify/:token', () => {
    return request(app.getHttpServer())
      .get('/account/verify/sometoken')
      .expect(200)
      .expect({ message: 'Email verified successfully' });
  });

  it('POST /account/forgot-password', () => {
    return request(app.getHttpServer())
      .post('/account/forgot-password')
      .send({ email: 'a@b.com' })
      .expect(200)
      .expect({ message: 'Password reset token created', reset_token: 'token', reset_link: '/account/reset-password/token' });
  });

  it('POST /account/reset-password', () => {
    return request(app.getHttpServer())
      .post('/account/reset-password')
      .send({ token: 'token', new_password: 'new' })
      .expect(200)
      .expect({ message: 'Password updated successfully' });
  });

  it('GET /account/:id', () => {
    return request(app.getHttpServer()).get('/account/1').expect(200).expect({ account_id: 1, email: 'a@b.com' });
  });

  it('GET /account/:accountId/profiles', () => {
    return request(app.getHttpServer()).get('/account/1/profiles').expect(200).expect([{ profile_id: 1, name: 'Profile 1' }]);
  });

  // Profile
  it('POST /profile', () => {
    return request(app.getHttpServer())
      .post('/profile')
      .send({ account_id: 1, name: 'New' })
      .expect(201)
      .expect({ profile_id: 1, account_id: 1, name: 'New' });
  });

  it('GET /profile', () => {
    return request(app.getHttpServer()).get('/profile').expect(200).expect([{ profile_id: 1, name: 'Profile 1' }]);
  });

  it('DELETE /profile/:id', () => {
    return request(app.getHttpServer()).delete('/profile/1').expect(200).expect({ affected: 1 });
  });

  // Content
  it('POST /content/play', () => {
    return request(app.getHttpServer()).post('/content/play').send({ profileId: 1, contentId: 2 }).expect(201).expect({ session_id: 1, profileId: 1, contentId: 2 });
  });

  it('POST /content/pause', () => {
    return request(app.getHttpServer()).post('/content/pause').send({ profileId: 1, contentId: 2 }).expect(201);
  });

  it('GET /content/resume', () => {
    return request(app.getHttpServer()).get('/content/resume?profileId=1&contentId=2').expect(200).expect({ last_position_seconds: 10, watched_seconds: 20, completed: false, auto_continued_next: false });
  });

  it('GET /content', () => {
    return request(app.getHttpServer()).get('/content').expect(200).expect([{ content_id: 1, title: 'Test' }]);
  });

  it('GET /content/by-id/:id', () => {
    return request(app.getHttpServer()).get('/content/by-id/1').expect(200).expect({ content_id: 1, title: 'Test' });
  });

  it('GET /content/by-age', () => {
    return request(app.getHttpServer()).get('/content/by-age?ageCategoryId=1').expect(200);
  });

  it('GET /content/currently-watching/:profileId', () => {
    return request(app.getHttpServer()).get('/content/currently-watching/1').expect(200).expect([]);
  });

  it('GET /content/personalised', () => {
    return request(app.getHttpServer()).get('/content/personalised?profileId=1').expect(200).expect([]);
  });

  // Discounts
  it('GET /discounts/me', () => {
    return request(app.getHttpServer()).get('/discounts/me?original_price=100').expect(200).expect({ percentage: 20, valid_until: '2099-01-01', active: true, price: 80 });
  });

  // Episodes
  it('GET /episodes', () => {
    return request(app.getHttpServer()).get('/episodes').expect(200).expect([{ episode_id: 1 }]);
  });

  // Series
  it('GET /series', () => {
    return request(app.getHttpServer()).get('/series').expect(200).expect([{ series_id: 1 }]);
  });

  it('GET /series/:seriesId', () => {
    return request(app.getHttpServer()).get('/series/1').expect(200).expect({ series_id: 1, name: 'Series' });
  });

  it('GET /series/:seriesId/episodes', () => {
    return request(app.getHttpServer()).get('/series/1/episodes').expect(200).expect([{ episode_id: 1 }]);
  });

  // Seasons
  it('GET /seasons', () => {
    return request(app.getHttpServer()).get('/seasons').expect(200).expect([{ season_id: 1 }]);
  });

  it('GET /seasons/:seasonId/episodes', () => {
    return request(app.getHttpServer()).get('/seasons/1/episodes').expect(200).expect([{ episode_id: 1 }]);
  });

  // Invitations
  it('POST /invitations', () => {
    return request(app.getHttpServer()).post('/invitations').send({ inviterAccountId: 1, inviteeAccountId: 2 }).expect(201).expect({ status: 'PENDING', discount_expiry_date: undefined });
  });

  it('POST /invitations/accept/:id', () => {
    return request(app.getHttpServer()).post('/invitations/accept/1').expect(200).expect({ status: 'ACCEPTED', discount_expiry_date: undefined });
  });

  it('GET /invitations/account/:accountId', () => {
    return request(app.getHttpServer()).get('/invitations/account/1').expect(200).expect([]);
  });

  it('GET /invitations/:id', () => {
    return request(app.getHttpServer()).get('/invitations/1').expect(200).expect({ status: 'PENDING', discount_expiry_date: undefined });
  });

  // Watchlist
  it('POST /watchlist', () => {
    return request(app.getHttpServer()).post('/watchlist').send({ profileId: 1, contentId: 2 }).expect(201).expect({ message: 'Added to watchlist' });
  });

  it('GET /watchlist/:profileId', () => {
    return request(app.getHttpServer()).get('/watchlist/1').expect(200).expect([]);
  });

  it('DELETE /watchlist/:profileId/:contentId', () => {
    return request(app.getHttpServer()).delete('/watchlist/1/2').expect(200).expect({ message: 'Removed from watchlist' });
  });
});
