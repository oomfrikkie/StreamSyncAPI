import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddToWatchlistDto {
  @ApiProperty()
  @IsInt()
  profileId: number;

  @ApiProperty()
  @IsInt()
  contentId: number;
}
