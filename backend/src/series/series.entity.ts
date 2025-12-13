import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Season } from '../season/season.entity';

@Entity('series')
export class Series {
  @PrimaryGeneratedColumn()
  serie_id: number;

  @Column()
  name: string;

  @OneToMany(() => Season, (season) => season.serie)
  seasons: Season[];
}
