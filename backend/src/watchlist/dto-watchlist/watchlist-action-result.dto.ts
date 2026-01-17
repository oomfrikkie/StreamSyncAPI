import { ApiProperty } from '@nestjs/swagger';

export class WatchlistActionResultDto {
  @ApiProperty({ example: 'Added to watchlist', xml: { name: 'message' } })
  message: string;
}
