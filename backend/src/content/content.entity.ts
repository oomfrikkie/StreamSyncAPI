import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quality } from './quality/quality.entity';

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

  @ManyToOne(() => Quality, quality => quality.contents)
  @JoinColumn({ name: 'quality_id' })
  quality: Quality;

  @Column({ name: 'duration_minutes', nullable: true })
  durationMinutes: number;
}