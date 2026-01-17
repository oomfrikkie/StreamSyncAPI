import { ApiProperty } from '@nestjs/swagger';

export class WatchlistItemResponseDto {
  @ApiProperty({ example: 1, xml: { name: 'content_id' } })
  content_id: number;

  @ApiProperty({ example: 'Movie Title', xml: { name: 'title' } })
  title: string;

  @ApiProperty({ example: 'movie', xml: { name: 'content_type' } })
  content_type: string;

  @ApiProperty({ example: '2026-01-01T12:00:00.000Z', xml: { name: 'added_at' } })
  added_at: string;
}
