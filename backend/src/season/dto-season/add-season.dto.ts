
import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSeasonDto {
  @ApiProperty({ example: 1, description: 'ID of the series to which the season belongs' })
  @IsInt()
  @IsNotEmpty()
  series_id: number;

  @ApiProperty({ example: 2, description: 'Season number within the series' })
  @IsInt()
  @IsNotEmpty()
  season_number: number;
}
