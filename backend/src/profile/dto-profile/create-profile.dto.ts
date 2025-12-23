import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
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
  image_url?: string;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  preferredGenres?: number[];

  @ApiProperty({ enum: ['SD', 'HD', 'UHD'], required: false })
  @IsOptional()
  @IsEnum(['SD', 'HD', 'UHD'])
  minQuality?: 'SD' | 'HD' | 'UHD';
}