import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Content } from '../content.entity';

@Entity('quality')
export class Quality {
  @PrimaryGeneratedColumn({ name: 'quality_id' })
  qualityId: number;

  @Column({ name: 'name' })
  name: 'SD' | 'HD' | 'UHD';

  @Column({ name: 'monthly_value', type: 'double precision' })
  monthlyValue: number;

  @OneToMany(() => Content, content => content.quality)
  contents: Content[];
}
