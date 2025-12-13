import { ApiProperty } from '@nestjs/swagger';

export class PauseContentDto {
  @ApiProperty()
  profileId: number;

  @ApiProperty()
  contentId: number;

  @ApiProperty()
  lastPositionSeconds: number;

  @ApiProperty()
  watchedSeconds: number;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  autoContinuedNext: boolean;
}
