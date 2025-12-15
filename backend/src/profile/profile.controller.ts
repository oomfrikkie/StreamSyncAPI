import { Controller, Post, Get, Body, Param, Delete} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto-profile/create-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

@Post()
  createProfile(@Body() dto: CreateProfileDto) {
    return this.profileService.create(dto);
  }

  @Get()
  getAllProfiles() {
    return this.profileService.getAllProfiles();
  }

  @Delete(':id')
  deleteProfile(@Param('id') id: number) {
    return this.profileService.delete(id);
  }
}
