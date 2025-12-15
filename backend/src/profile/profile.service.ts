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
    // Make sure account exists
    const account = await this.accountRepo.findOne({
      where: { account_id: dto.account_id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Make sure age category exists
    const ageCategory = await this.ageRepo.findOne({
      where: { age_category_id: dto.age_category_id },
    });

    if (!ageCategory) {
      throw new NotFoundException('Age category not found');
    }

    // Create profile object
    const newProfile = this.profileRepo.create({
      name: dto.name,
      image_url: dto.image_url ?? null,
      account: account,
      age_category: ageCategory, // EXACT NAME FROM ENTITY
    });

    const saved = await this.profileRepo.save(newProfile);

return {
  profile_id: saved.profile_id,
  name: saved.name,
  image_url: saved.image_url,
  age_category: {
    age_category_id: ageCategory.age_category_id,
    name: ageCategory.name,
  },
};

  }


  async getAllProfiles() {
    return this.profileRepo.find({
      relations: ['account', 'age_category'],
    });
  }

  
async delete(profileId: number) {
  const profile = await this.profileRepo.findOne({
    where: { profile_id: profileId },
  });

  if (!profile) {
    throw new NotFoundException('Profile not found');
  }

  await this.profileRepo.remove(profile);
  return { message: 'Profile deleted' };
}

}
