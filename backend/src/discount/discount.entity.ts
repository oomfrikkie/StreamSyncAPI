import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('discount')
export class Discount {
  @PrimaryGeneratedColumn({ name: 'discount_id' })
  discountId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'source' })
  source: string;

  @Column({ name: 'percentage' })
  percentage: number;

  @Column({ name: 'valid_from', type: 'date' })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'date' })
  validUntil: Date;

  @Column({ name: 'active', default: true })
  active: boolean;
}