import { Controller, Get, Post, Delete, Param, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as js2xmlparser from 'js2xmlparser';
import { ApiProduces, ApiOkResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto } from './dto-watchlist/add-to-watchlist.dto';
import { WatchlistItemResponseDto } from './dto-watchlist/watchlist-item-response.dto';
import { WatchlistActionResultDto } from './dto-watchlist/watchlist-action-result.dto';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  // ADD TO WATCHLIST
  @ApiProduces('application/xml', 'application/json')
  @ApiConsumes('application/xml', 'application/json')
  @ApiBody({ type: AddToWatchlistDto, description: 'Add to watchlist', required: true })
  @ApiOkResponse({ type: WatchlistActionResultDto })
  @Post()
  async addToWatchlist(@Body() dto: AddToWatchlistDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.watchlistService.addToWatchList(dto.profileId, dto.contentId);
    const dtoResult: WatchlistActionResultDto = { message: result.message };
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('result', dtoResult));
    }
    return res.json(dtoResult);
  }


  // GET WATCHLIST BY PROFILE
  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: WatchlistItemResponseDto, isArray: true })
  @Get(':profileId')
  async getWatchlist(@Param('profileId') profileId: number, @Req() req: Request, @Res() res: Response) {
    const result = await this.watchlistService.getWatchlistByProfile(Number(profileId));
    const dtoArr: WatchlistItemResponseDto[] = result.map((item: any) => ({
      content_id: item.content_id,
      title: item.title,
      content_type: item.content_type,
      added_at: item.added_at,
    }));
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('watchlist', { item: dtoArr }));
    }
    return res.json(dtoArr);
  }

  // REMOVE FROM WATCHLIST
  @ApiProduces('application/json', 'application/xml')
  @ApiOkResponse({ type: WatchlistActionResultDto })
  @Delete(':profileId/:contentId')
  async removeFromWatchlist(
    @Param('profileId') profileId: number,
    @Param('contentId') contentId: number,
    @Req() req: Request, @Res() res: Response
  ) {
    const result = await this.watchlistService.removeFromWatchlist(Number(profileId), Number(contentId));
    const dtoResult: WatchlistActionResultDto = { message: result.message };
    if (req.headers.accept && req.headers.accept.includes('application/xml')) {
      res.set('Content-Type', 'application/xml');
      return res.send(js2xmlparser.parse('result', dtoResult));
    }
    return res.json(dtoResult);
  }
}
