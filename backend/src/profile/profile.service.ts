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
    private readonly ageCategoryRepo: Repository<AgeCategory>,
  ) {}

  async create(dto: CreateProfileDto) {
    const account = await this.accountRepo.findOne({
      where: { account_id: dto.account_id },
    });
    if (!account) throw new NotFoundException('Account not found');

    const ageCategory = await this.ageCategoryRepo.findOne({
      where: { age_category_id: dto.age_category_id },
    });
    if (!ageCategory) throw new NotFoundException('Age category not found');

    const profile = this.profileRepo.create({
      name: dto.name,
      image_url: dto.image_url ?? null,
      account,
      age_category: ageCategory,
    });

    return this.profileRepo.save(profile);
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
