import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsBoolean,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class PauseContentDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  profileId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  contentId: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  lastPositionSeconds: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  watchedSeconds: number;

  @ApiProperty()
  @IsBoolean()
  completed: boolean;

  @ApiProperty()
  @IsBoolean()
  autoContinuedNext: boolean;
}
