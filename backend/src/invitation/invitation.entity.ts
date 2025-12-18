import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('invitation')
export class Invitation {
  @PrimaryGeneratedColumn({ name: 'invitation_id' })
  invitationId: number;

  @Column({ name: 'inviter_account_id' })
  inviterAccountId: number;

  @Column({ name: 'invitee_account_id' })
  inviteeAccountId: number;

  @Column({ name: 'status' })
  status: string;

  @Column({ name: 'sent_timestamp', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sentTimestamp: Date;

  @Column({ name: 'accepted_timestamp', type: 'timestamp', nullable: true })
  acceptedTimestamp?: Date;

  @Column({ name: 'discount_expiry_date', type: 'date', nullable: true })
discountExpiryDate?: Date;
}