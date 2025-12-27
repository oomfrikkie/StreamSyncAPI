import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Genre } from '../content/genre/genre.entity';
import { AgeCategory } from '../age-category/age-category.entity';
import { Quality } from 'src/content/quality/quality.entity';

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn({ name: 'profile_id' })
  profile_id: number;

  @Column({ name: 'account_id' })
  account_id: number;

  @Column({ name: 'age_category_id' })
  age_category_id: number;

  @ManyToOne(() => AgeCategory)
  @JoinColumn({ name: 'age_category_id' })
  age_category: AgeCategory;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  image_url: string | null;

  @Column({ name: 'min_quality_id' })
  min_quality_id: number;

  // 🔥 THIS IS THE FIX
  @ManyToOne(() => Quality)
  @JoinColumn({ name: 'min_quality_id' })
  min_quality: Quality;

  @ManyToMany(() => Genre, { eager: true })
  @JoinTable({
    name: 'profile_genre_preference',
    joinColumn: { name: 'profile_id' },
    inverseJoinColumn: { name: 'genre_id' },
  })
  preferredGenres: Genre[];
}

