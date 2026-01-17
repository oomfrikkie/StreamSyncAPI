// ...imports and class definition remain unchanged...
import { Controller, Post, Patch, Body, Get, Param, Req, Res } from '@nestjs/common';
import { Query } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { ApiProduces, ApiOkResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ViewingSessionService } from './viewing-session.service';
import { PlayViewingSessionDto } from './dto-viewing-session/play.dto';
import { PauseViewingSessionDto } from './dto-viewing-session/pause.dto';
import { ViewingSessionResponseDto } from './dto-viewing-session/viewing-session-response.dto';

@Controller('viewing-session')
export class ViewingSessionController {
  constructor(private readonly viewingSessionService: ViewingSessionService) {}

  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/json', 'application/xml')
  @ApiBody({
    type: PlayViewingSessionDto,
    description: 'Start a viewing session',
    required: true,
  })
  @ApiOkResponse({
    description: 'Viewing session started',
    schema: {
      type: 'object',
      properties: {
        profile_id: { type: 'integer', example: 1 },
        content_id: { type: 'integer', example: 10 },
        last_position_seconds: { type: 'integer', example: 0 },
        watched_seconds: { type: 'integer', example: 0 },
        completed: { type: 'boolean', example: false },
        auto_continued_next: { type: 'boolean', example: false },
        start_timestamp: { type: 'string', example: '2026-01-17T18:00:00.000Z' }
      }
    },
    content: {
      'application/xml': {
        schema: {
          type: 'object',
          properties: {
            profile_id: { type: 'integer', example: 1 },
            content_id: { type: 'integer', example: 10 },
            last_position_seconds: { type: 'integer', example: 0 },
            watched_seconds: { type: 'integer', example: 0 },
            completed: { type: 'boolean', example: false },
            auto_continued_next: { type: 'boolean', example: false },
            start_timestamp: { type: 'string', example: '2026-01-17T18:00:00.000Z' }
          }
        }
      },
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            profile_id: { type: 'integer', example: 1 },
            content_id: { type: 'integer', example: 10 },
            last_position_seconds: { type: 'integer', example: 0 },
            watched_seconds: { type: 'integer', example: 0 },
            completed: { type: 'boolean', example: false },
            auto_continued_next: { type: 'boolean', example: false },
            start_timestamp: { type: 'string', example: '2026-01-17T18:00:00.000Z' }
          }
        }
      }
    }
  })
  @Post()
  async createViewingSession(@Body() dto: PlayViewingSessionDto, @Req() req: Request, @Res() res: Response) {
    // Debug log: print the parsed request body
    console.log('DEBUG /viewing-session POST req.body:', req.body);
    const result = await this.viewingSessionService.startViewingSession(dto);
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('session', result));
    }
    return res.json(result);
  }

  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/json', 'application/xml')
  @ApiBody({
    type: PauseViewingSessionDto,
    description: 'Pause a viewing session',
    required: true,
  })
  @ApiOkResponse({
    description: 'Viewing session progress saved',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Progress saved' }
      }
    },
    content: {
      'application/xml': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Progress saved' }
          }
        }
      },
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Progress saved' }
          }
        }
      }
    }
  })
  @Patch()
  async updateViewingSession(@Body() dto: PauseViewingSessionDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.viewingSessionService.saveViewingProgress(dto);
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('result', result));
    }
    return res.json(result);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ViewingSessionResponseDto, isArray: true })
  @Get('currently-watching/:profileId')
  async getCurrentlyWatching(@Param('profileId') profileId: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.viewingSessionService.getCurrentlyWatching(Number(profileId));
    const dtoArr: ViewingSessionResponseDto[] = result.map((item: any) => ({
      profile_id: Number(profileId),
      content_id: item.content_id,
      last_position_seconds: item.last_position_seconds,
      watched_seconds: item.watched_seconds,
      completed: false,
      auto_continued_next: false,
      start_timestamp: item.start_timestamp,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('viewingSessions', { viewingSession: dtoArr }));
    }
    return res.json(dtoArr);
  }

  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ViewingSessionResponseDto })
  @Get(':profileId/:contentId')
  async getViewingProgress(
    @Param('profileId') profileId: string,
    @Param('contentId') contentId: string,
    @Req() req: Request, @Res() res: Response
  ) {
    const result = await this.viewingSessionService.getViewingProgress(Number(profileId), Number(contentId));
    const dto = result
      ? {
          profile_id: Number(profileId),
          content_id: Number(contentId),
          last_position_seconds: result.last_position_seconds,
          watched_seconds: result.watched_seconds,
          completed: result.completed,
          auto_continued_next: result.auto_continued_next,
        }
      : {};
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('viewingSession', dto));
    }
    return res.json(dto);
  }
  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: ViewingSessionResponseDto })
  @Get('resume')
  async resumeViewingSession(
    @Query('profileId') profileId: string,
    @Query('contentId') contentId: string,
    @Req() req: Request, @Res() res: Response
  ) {
    const result = await this.viewingSessionService.getViewingProgress(Number(profileId), Number(contentId));
    const dto = result
      ? {
          profile_id: Number(profileId),
          content_id: Number(contentId),
          last_position_seconds: result.last_position_seconds,
          watched_seconds: result.watched_seconds,
          completed: result.completed,
          auto_continued_next: result.auto_continued_next,
        }
      : {};
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('viewingSession', dto));
    }
    return res.json(dto);
  }
}
