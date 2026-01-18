import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('age_category')
export class AgeCategory {
  @PrimaryGeneratedColumn()
  age_category_id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  guidelines_text: string;
}
