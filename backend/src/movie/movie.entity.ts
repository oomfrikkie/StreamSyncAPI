import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Content } from '../content/content.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  movie_id: number;

  @Column({ unique: true })
  content_id: number;

  @OneToOne(() => Content)
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
