import { Controller, Post, Body, Get, Query, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import { ContentResponseDto } from './content.dto';
import { ApiQuery } from '@nestjs/swagger';
import { ContentService } from './content.service';
// ...existing code...

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

// ...existing code...

// ...existing code...

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ContentResponseDto, isArray: true })
  @Get('')
  async getAll(@Req() req: Request, @Res() res: Response) {
    const result = await this.contentService.getAllContent();
    const dtoArr: ContentResponseDto[] = result.map((item: any) => ({
      contentId: item.content_id,
      ageCategoryId: item.age_category_id,
      title: item.title,
      description: item.description,
      contentType: item.content_type,
      quality: item.quality_id || item.quality,
      durationMinutes: item.duration_minutes,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('contents', { content: dtoArr }));
    }
    return res.json(dtoArr);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ContentResponseDto })
  @Get('by-id/:id')
  async getById(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.contentService.getContentById(Number(id));
    let dto: ContentResponseDto | null = null;
    if (result) {
      dto = {
        contentId: result.content_id,
        ageCategoryId: result.age_category_id,
        title: result.title,
        description: result.description,
        contentType: result.content_type,
        quality: result.quality_id || result.quality,
        durationMinutes: result.duration_minutes,
      };
    }
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('content', dto));
    }
    return res.json(dto);
  }

  @ApiQuery({ name: 'ageCategoryId', required: true, type: Number })
  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ContentResponseDto, isArray: true })
  @Get('by-age')
  async getByAge(@Query('ageCategoryId') ageCategoryId: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.contentService.getContentBasedOnAgeRating(Number(ageCategoryId));
    const dtoArr: ContentResponseDto[] = result.map((item: any) => ({
      contentId: item.content_id,
      ageCategoryId: item.age_category_id,
      title: item.title,
      description: item.description,
      contentType: item.content_type,
      quality: item.quality_id || item.quality,
      durationMinutes: item.duration_minutes,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('contents', { content: dtoArr }));
    }
    return res.json(dtoArr);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ContentResponseDto, isArray: true })
  @Get('currently-watching/:profileId')
  async currentlyWatching(@Param('profileId') profileId: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.contentService.currentlyWatching(Number(profileId));
    const dtoArr: ContentResponseDto[] = result.map((item: any) => ({
      contentId: item.content_id,
      ageCategoryId: item.age_category_id,
      title: item.title,
      description: item.description,
      contentType: item.content_type,
      quality: item.quality_id || item.quality,
      durationMinutes: item.duration_minutes,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('contents', { content: dtoArr }));
    }
    return res.json(dtoArr);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ContentResponseDto, isArray: true })
  @Get('personalised')
  async getPersonalised(@Query('profileId') profileId: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.contentService.getPersonalisedContent(Number(profileId));
    const dtoArr: ContentResponseDto[] = result.map((item: any) => ({
      contentId: item.content_id,
      ageCategoryId: item.age_category_id,
      title: item.title,
      description: item.description,
      contentType: item.content_type || item.type,
      quality: item.quality_id || item.quality || item.quality_name,
      durationMinutes: item.duration_minutes,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('contents', { content: dtoArr }));
    }
    return res.json(dtoArr);
  }
}