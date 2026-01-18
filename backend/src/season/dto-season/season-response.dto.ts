import { ApiProperty } from '@nestjs/swagger';

export class SeasonResponseDto {
  @ApiProperty({ example: 1, xml: { name: 'season_id' } })
  season_id: number;

  @ApiProperty({ example: 1, xml: { name: 'series_id' } })
  series_id: number;

  @ApiProperty({ example: 'My New Series', xml: { name: 'series_name' } })
  series_name: string;

  @ApiProperty({ example: 2, xml: { name: 'season_number' } })
  season_number: number;
}
