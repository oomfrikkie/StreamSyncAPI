import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Profile } from './profile.entity';
import { Genre } from '../content/genre/genre.entity';
import { CreateProfileDto } from './dto-profile/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
  ) {}

  async create(dto: CreateProfileDto) {
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
      preferredGenres: genres,
      minQuality: dto.minQuality ?? 'SD',
    });

    return this.profileRepo.save(profile);
  }

  async getAllProfiles() {
    return this.profileRepo.find();
  }
}