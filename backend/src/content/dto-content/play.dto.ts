import { ApiProperty } from '@nestjs/swagger';

export class PlayContentDto {
  @ApiProperty()
  profileId: number;

  @ApiProperty()
  contentId: number;
}
