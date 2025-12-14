import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class PlayContentDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  profileId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  contentId: number;
}
