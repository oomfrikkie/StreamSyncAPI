import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, Min } from 'class-validator';

export class PauseViewingSessionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  profileId: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  contentId: number;

  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(0)
  lastPositionSeconds: number;

  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(0)
  watchedSeconds: number;

  @ApiProperty({ example: 360 })
  @IsInt()
  @Min(1)
  durationSeconds: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  autoContinuedNext: boolean;
}
