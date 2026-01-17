import { ApiProperty } from '@nestjs/swagger';

export class EpisodeResponseDto {
  @ApiProperty({ example: 1, xml: { name: 'episode_id' } })
  episode_id: number;

  @ApiProperty({ example: 1, xml: { name: 'content_id' } })
  content_id: number;

  @ApiProperty({ example: 'Episode Title', xml: { name: 'title' } })
  title: string;

  @ApiProperty({ example: 45, xml: { name: 'duration_minutes' } })
  duration_minutes: number;

  @ApiProperty({ example: 1, xml: { name: 'episode_number' } })
  episode_number: number;

  @ApiProperty({ example: 2, xml: { name: 'season_number' }, required: false })
  season_number?: number;

  @ApiProperty({ example: 'Series Name', xml: { name: 'series_name' }, required: false })
  series_name?: string;
}
