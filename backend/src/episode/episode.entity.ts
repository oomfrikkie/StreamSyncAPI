import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Season } from '../season/season.entity';
import { Content } from '../content/content.entity';

@Entity('episode')
export class Episode {
  @PrimaryGeneratedColumn()
  episode_id: number;

  @Column()
  episode_number: number;

  @Column()
  name: string;

  @Column()
  duration_minutes: number;

  @Column()
  content_id: number;

  @Column()
  season_id: number;

  @ManyToOne(() => Season, (season) => season.episodes)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @ManyToOne(() => Content)
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
