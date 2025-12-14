import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

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
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image_url?: string;
}
