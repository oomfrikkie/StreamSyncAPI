import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Content } from '../content.entity';

@Entity('quality')
export class Quality {
  @PrimaryGeneratedColumn({ name: 'quality_id' })
  qualityId: number;

  @Column({ name: 'name' })
  name: string;

  @OneToMany(() => Content, content => content.quality)
  contents: Content[];
}
