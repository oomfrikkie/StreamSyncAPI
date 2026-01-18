import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Series } from '../series/series.entity';
import { Episode } from '../episode/episode.entity';

@Entity('season')
export class Season {
  @PrimaryGeneratedColumn()
  season_id: number;

  @Column()
  season_number: number;

  @Column()
  serie_id: number;

  @ManyToOne(() => Series, (series) => series.seasons)
  @JoinColumn({ name: 'serie_id' })
  serie: Series;

  @OneToMany(() => Episode, (episode) => episode.season)
  episodes: Episode[];
}
