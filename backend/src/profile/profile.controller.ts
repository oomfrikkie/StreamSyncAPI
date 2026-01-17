import { Controller, Post, Get, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto-profile/create-profile.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
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
