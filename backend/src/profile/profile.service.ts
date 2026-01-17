import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Profile } from './profile.entity';
import { Genre } from '../content/genre/genre.entity';
import { CreateProfileDto } from './dto-profile/create-profile.dto';
import { ProfileDto } from './dto-profile/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
  ) {}

  async create(dto: CreateProfileDto): Promise<ProfileDto> {
    const genres = dto.preferredGenres
      ? await this.genreRepo.find({
          where: { genreId: In(dto.preferredGenres) },
        })
      : [];

    const profile = this.profileRepo.create({
      account_id: dto.account_id,
      age_category_id: dto.age_category_id,
      name: dto.name,
      image_url: dto.image_url ?? null,
      min_quality_id: dto.minQualityId,
      preferredGenres: genres,
    
    });

    const saved = await this.profileRepo.save(profile);
    return Object.assign(new ProfileDto(), {
      id: saved.profile_id,
      account_id: saved.account_id,
      age_category_id: saved.age_category_id,
      name: saved.name,
      image_url: saved.image_url,
      preferredGenres: saved.preferredGenres?.map(g => g.genreId),
      minQualityId: saved.min_quality_id,
    });
  }

  async getAllProfiles(): Promise<ProfileDto[]> {
    const profiles = await this.profileRepo.find({ relations: ['preferredGenres'] });
    return profiles.map(saved => Object.assign(new ProfileDto(), {
      id: saved.profile_id,
      account_id: saved.account_id,
      age_category_id: saved.age_category_id,
      name: saved.name,
      image_url: saved.image_url,
      preferredGenres: saved.preferredGenres?.map(g => g.genreId),
      minQualityId: saved.min_quality_id,
    }));
  }

  async delete(id: number) {
    return this.profileRepo.delete(id);
  }
}