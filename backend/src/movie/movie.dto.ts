import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  age_category_id: number;

  @ApiProperty({ example: 'Test Movie Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A test movie description.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  quality_id: number;

  @ApiProperty({ example: 120 })
  @IsInt()
  duration_minutes: number;
}
