import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class PlayViewingSessionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  profileId: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  contentId: number;
}
