import { ApiProperty } from '@nestjs/swagger';

export class ViewingSessionResponseDto {
  @ApiProperty({ example: 1, xml: { name: 'profile_id' } })
  profile_id: number;

  @ApiProperty({ example: 1, xml: { name: 'content_id' } })
  content_id: number;

  @ApiProperty({ example: 120, xml: { name: 'last_position_seconds' } })
  last_position_seconds: number;

  @ApiProperty({ example: 300, xml: { name: 'watched_seconds' } })
  watched_seconds: number;

  @ApiProperty({ example: false, xml: { name: 'completed' } })
  completed: boolean;

  @ApiProperty({ example: false, xml: { name: 'auto_continued_next' } })
  auto_continued_next: boolean;

  @ApiProperty({ example: '2026-01-17T12:00:00.000Z', xml: { name: 'start_timestamp' }, required: false })
  start_timestamp?: string;
}
