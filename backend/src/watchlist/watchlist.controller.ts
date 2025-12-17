import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto } from './dto-watchlist/add-to-watchlist.dto';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  // ADD TO WATCHLIST
  @Post()
    addToWatchlist(@Body() dto: AddToWatchlistDto) {
    return this.watchlistService.addToWatchList(
        dto.profileId,
        dto.contentId,
  );
}


  // GET WATCHLIST BY PROFILE
  @Get(':profileId')
  getWatchlist(@Param('profileId') profileId: number) {
    return this.watchlistService.getWatchlistByProfile(Number(profileId));
  }

  // REMOVE FROM WATCHLIST
  @Delete(':profileId/:contentId')
  removeFromWatchlist(
    @Param('profileId') profileId: number,
    @Param('contentId') contentId: number,
  ) {
    return this.watchlistService.removeFromWatchlist(
      Number(profileId),
      Number(contentId),
    );
  }
}
