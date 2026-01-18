import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
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
  season_id: number;

  @Column()
  content_id: number;

  @ManyToOne(() => Season, season => season.episodes)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @OneToOne(() => Content)
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
