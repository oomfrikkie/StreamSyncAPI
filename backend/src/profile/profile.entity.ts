import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Genre } from '../content/genre/genre.entity';

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn({ name: 'profile_id' })
  profile_id: number;

  @Column({ name: 'account_id' })
  account_id: number;

  @Column({ name: 'age_category_id' })
  age_category_id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'image_url', nullable: true })
  image_url: string | null;

  @ManyToMany(() => Genre, { eager: true })
  @JoinTable({
    name: 'profile_genre_preference',
    joinColumn: { name: 'profile_id' },
    inverseJoinColumn: { name: 'genre_id' },
  })
  preferredGenres: Genre[];

  @Column({ name: 'min_quality', default: 'SD' })
  minQuality: 'SD' | 'HD' | 'UHD';
}