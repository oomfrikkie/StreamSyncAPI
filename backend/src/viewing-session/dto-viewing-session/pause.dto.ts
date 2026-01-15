import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, Min } from 'class-validator';

export class PauseViewingSessionDto {
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
  @IsInt()
  @Min(1)
  durationSeconds: number;

  @ApiProperty()
  @IsBoolean()
  autoContinuedNext: boolean;
}
