import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from './profile.entity';
import { Account } from '../account/account.entity';
import { AgeCategory } from '../age-category/age-category.entity';
import { CreateProfileDto } from './dto-profile/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    @InjectRepository(AgeCategory)
    private readonly ageRepo: Repository<AgeCategory>,
  ) {}

  async create(dto: CreateProfileDto) {
  const account = await this.accountRepo.findOne({
    where: { account_id: dto.account_id },
  });

  if (!account) {
    throw new NotFoundException('Account not found');
  }

  const ageCategory = await this.ageRepo.findOne({
    where: { age_category_id: dto.age_category_id },
  });

  if (!ageCategory) {
    throw new NotFoundException('Age category not found');
  }

  const newProfile = this.profileRepo.create({
    name: dto.name,
    image_url: dto.image_url ?? null,
    account: account,
    age_category: ageCategory,
  });

  const saved = await this.profileRepo.save(newProfile);

  return {
    profile_id: saved.profile_id,
    name: saved.name,
    image_url: saved.image_url,
    account_email: account.email,
    age_category: {
      age_category_id: ageCategory.age_category_id,
      name: ageCategory.name,
    },
  };
}


  async getProfilesByAccount(accountId: number) {
    return this.profileRepo.find({
      where: { account: { account_id: accountId } },
      relations: ['age_category'],
    });
  }

  async getAllProfiles() {
    return this.profileRepo.find({
      relations: ['account', 'age_category'],
    });
  }
}
