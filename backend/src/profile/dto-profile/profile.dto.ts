import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({ example: 1, xml: { name: 'id' } })
  id: number;

  @ApiProperty({ example: 1, xml: { name: 'account_id' } })
  account_id: number;

  @ApiProperty({ example: 2, xml: { name: 'age_category_id' } })
  age_category_id: number;

  @ApiProperty({ example: 'John', xml: { name: 'name' } })
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false, xml: { name: 'image_url' } })
  image_url?: string;

  @ApiProperty({ type: [Number], required: false, xml: { name: 'preferredGenres', wrapped: true } })
  preferredGenres?: number[];

  @ApiProperty({ example: 1, description: 'FK to quality table', xml: { name: 'minQualityId' } })
  minQualityId: number;
}
