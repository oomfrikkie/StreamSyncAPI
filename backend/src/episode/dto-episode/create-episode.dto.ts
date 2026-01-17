import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateEpisodeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  series_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  season_number: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  episode_number: number;

  @ApiProperty({ example: 'Episode Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Episode description.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  age_category_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  quality_id: number;

  @ApiProperty({ example: 45 })
  @IsInt()
  duration_minutes: number;
}
