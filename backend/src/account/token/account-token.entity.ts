import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../account.entity';

@Entity('account_token')
export class AccountToken {
  @PrimaryGeneratedColumn()
  token_id: number;

  @Column()
  token: string;

  @Column()
  token_type: string; // "EMAIL_VERIFICATION" / "PASSWORD_RESET"

  @Column()
  expires_at: Date;

  @Column({ default: false })
  is_used: boolean;

  @Column({ nullable: true })
  used_at: Date;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
