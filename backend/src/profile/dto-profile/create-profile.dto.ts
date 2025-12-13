import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty()
  account_id: number;

  @ApiProperty()
  age_category_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  image_url?: string;
}
