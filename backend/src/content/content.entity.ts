import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn({ name: 'content_id' })
  contentId: number;

  @Column({ name: 'age_category_id' })
  ageCategoryId: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'content_type' })
  contentType: string;

  @Column({ name: 'quality_id' })
  qualityId: number;
}