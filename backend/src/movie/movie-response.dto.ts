import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty({ example: 1, xml: { name: 'movie_id' } })
  movie_id: number;

  @ApiProperty({ example: 2, xml: { name: 'age_category_id' } })
  age_category_id: number;

  @ApiProperty({ example: 'Test Movie Title', xml: { name: 'title' } })
  title: string;

  @ApiProperty({ example: 'A test movie description.', xml: { name: 'description' } })
  description: string;

  @ApiProperty({ example: 1, xml: { name: 'quality_id' } })
  quality_id: number;

  @ApiProperty({ example: 120, xml: { name: 'duration_minutes' } })
  duration_minutes: number;
}
