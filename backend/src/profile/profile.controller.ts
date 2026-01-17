import { Controller, Post, Get, Body, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto-profile/create-profile.dto';
import { ApiBearerAuth, ApiProduces, ApiOkResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProfileDto } from './dto-profile/profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/xml', 'application/json')
  @ApiBody({ type: CreateProfileDto, description: 'Create profile', required: true })
  @ApiOkResponse({ type: ProfileDto })
  @Post()
  async createProfile(@Body() dto: CreateProfileDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.profileService.create(dto);
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('profile', result));
    }
    return res.json(result);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: [ProfileDto] })
  @Get()
  async getAllProfiles(@Req() req: Request, @Res() res: Response) {
    const result = await this.profileService.getAllProfiles();
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('profiles', { profile: result }));
    }
    return res.json(result);
  }

  @ApiProduces('application/json', 'application/xml')
  @Delete(':id')
  async deleteProfile(@Param('id') id: number, @Req() req: Request, @Res() res: Response) {
    const result = await this.profileService.delete(id);
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('deleteResult', result));
    }
    return res.json(result);
  }
}
