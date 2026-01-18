import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Content } from '../content/content.entity';

@Entity('watchlist_item')
export class WatchlistItem {
  @PrimaryColumn()
  profile_id: number;

  @PrimaryColumn()
  content_id: number;

  @CreateDateColumn({ type: 'timestamp', name: 'added_at' })
  added_at: Date;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
