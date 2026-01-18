import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddSeriesDto {
  @ApiProperty({ example: 'My New Series' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
