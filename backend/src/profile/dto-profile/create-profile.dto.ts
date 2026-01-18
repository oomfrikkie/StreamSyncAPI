import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateProfileDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  account_id: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  age_category_id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  preferredGenres?: number[];

  @ApiProperty({ description: 'FK to quality table' })
  @IsInt()
  minQualityId: number;
}
