import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('genre')
export class Genre {
  @PrimaryGeneratedColumn({ name: 'genre_id' })
  genreId: number;

  @Column({ name: 'name' })
  name: string;
}