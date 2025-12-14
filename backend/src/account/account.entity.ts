import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  account_id: number;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ default: 0 })
  failed_login_attempts: number;

  @CreateDateColumn()
  created_timestamp: Date;
}
