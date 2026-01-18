import { ApiProperty } from '@nestjs/swagger';

export class SeriesResponseDto {
  @ApiProperty({ example: 1, xml: { name: 'series_id' } })
  series_id: number;

  @ApiProperty({ example: 'My New Series', xml: { name: 'name' } })
  name: string;
}
