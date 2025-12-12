import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto-profile/create-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

<<<<<<< Updated upstream
  @Post('create')
=======
  @Post()
>>>>>>> Stashed changes
  createProfile(@Body() dto: CreateProfileDto) {
    return this.profileService.create(dto);
  }

  @Get('account/:id')
  getProfilesByAccount(@Param('id') id: number) {
    return this.profileService.getProfilesByAccount(id);
  }

  @Get()
  getAllProfiles() {
    return this.profileService.getAllProfiles();
  }
}
