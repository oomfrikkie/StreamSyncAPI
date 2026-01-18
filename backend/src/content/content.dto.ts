import { ApiProperty } from '@nestjs/swagger';
export class ContentResponseDto {
  @ApiProperty({ example: 1, xml: { name: 'contentId' } })
  contentId: number;

  @ApiProperty({ example: 2, xml: { name: 'ageCategoryId' } })
  ageCategoryId: number;

  @ApiProperty({ example: 'Movie Title', xml: { name: 'title' } })
  title: string;

  @ApiProperty({ example: 'A description', required: false, xml: { name: 'description' } })
  description?: string;

  @ApiProperty({ example: 'movie', xml: { name: 'contentType' } })
  contentType: string;

  @ApiProperty({ example: 'HD', required: false, xml: { name: 'quality' } })
  quality?: any;

  @ApiProperty({ example: 120, required: false, xml: { name: 'durationMinutes' } })
  durationMinutes?: number;
}
