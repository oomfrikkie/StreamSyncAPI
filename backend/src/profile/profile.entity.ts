import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Account } from '../account/account.entity';
import { AgeCategory } from '../age-category/age-category.entity';

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn()
  profile_id: number;

  @Column({ length: 100 })
  name: string;
  
@Column({ type: 'varchar', length: 500, nullable: true })
image_url: string | null;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => AgeCategory)
  @JoinColumn({ name: 'age_category_id' })
  age_category: AgeCategory;
}
