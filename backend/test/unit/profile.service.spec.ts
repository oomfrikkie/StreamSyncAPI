import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ProfileService } from 'src/profile/profile.service';
import { Profile } from 'src/profile/profile.entity';
import { Genre } from 'src/content/genre/genre.entity';

const mockProfileRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
});

const mockGenreRepo = () => ({
  find: jest.fn(),
});

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepo: ReturnType<typeof mockProfileRepo>;
  let genreRepo: ReturnType<typeof mockGenreRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Profile), useFactory: mockProfileRepo },
        { provide: getRepositoryToken(Genre), useFactory: mockGenreRepo },
      ],
    }).compile();

    service = module.get(ProfileService);
    profileRepo = module.get(getRepositoryToken(Profile));
    genreRepo = module.get(getRepositoryToken(Genre));
  });

  describe('create', () => {
    it('creates and returns a profile DTO', async () => {
      genreRepo.find.mockResolvedValue([]);
      profileRepo.create.mockReturnValue({ profile_id: 1, account_id: 1, age_category_id: 1, name: 'Alice', image_url: null, min_quality_id: 1, preferredGenres: [] });
      profileRepo.save.mockResolvedValue({ profile_id: 1, account_id: 1, age_category_id: 1, name: 'Alice', image_url: null, min_quality_id: 1, preferredGenres: [] });

      const result = await service.create({ account_id: 1, age_category_id: 1, name: 'Alice', minQualityId: 1 });

      expect(result.name).toBe('Alice');
      expect(result.account_id).toBe(1);
    });

    it('throws BadRequestException on foreign key violation', async () => {
      genreRepo.find.mockResolvedValue([]);
      profileRepo.create.mockReturnValue({});
      const fkError = Object.assign(new Error('FK'), { code: '23503' });
      profileRepo.save.mockRejectedValue(fkError);

      await expect(
        service.create({ account_id: 999, age_category_id: 999, name: 'X', minQualityId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllProfiles', () => {
    it('returns a list of profile DTOs', async () => {
      profileRepo.find.mockResolvedValue([
        { profile_id: 1, account_id: 1, age_category_id: 1, name: 'Alice', image_url: null, min_quality_id: 1, preferredGenres: [] },
        { profile_id: 2, account_id: 2, age_category_id: 1, name: 'Bob', image_url: null, min_quality_id: 1, preferredGenres: [] },
      ]);

      const result = await service.getAllProfiles();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
    });

    it('returns empty array when there are no profiles', async () => {
      profileRepo.find.mockResolvedValue([]);

      const result = await service.getAllProfiles();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('calls repository delete with the given id', async () => {
      profileRepo.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(profileRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
