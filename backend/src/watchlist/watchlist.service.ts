import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class WatchlistService {
  constructor(private readonly dataSource: DataSource) {}

  async addToWatchList(profileId: number, contentId: number) {
    // prevent duplicates
    const existsQuery = `
      SELECT 1
      FROM watchlist_item
      WHERE profile_id = $1 AND content_id = $2
    `;

    const exists = await this.dataSource.query(existsQuery, [
      profileId,
      contentId,
    ]);

    if (exists.length > 0) {
      throw new BadRequestException('Already in watchlist');
    }

    const insertQuery = `
      INSERT INTO watchlist_item (profile_id, content_id)
      VALUES ($1, $2)
    `;

    await this.dataSource.query(insertQuery, [profileId, contentId]);

    return { message: 'Added to watchlist' };
  }

  async getWatchlistByProfile(profileId: number) {
    const query = `
      SELECT
        c.content_id,
        c.title,
        c.content_type,
        w.added_at
      FROM watchlist_item w
      JOIN content c ON c.content_id = w.content_id
      WHERE w.profile_id = $1
      ORDER BY w.added_at DESC;
    `;

    return this.dataSource.query(query, [profileId]);
  }

  async removeFromWatchlist(profileId: number, contentId: number) {
    const query = `
      DELETE FROM watchlist_item
      WHERE profile_id = $1 AND content_id = $2;
    `;

    await this.dataSource.query(query, [profileId, contentId]);

    return { message: 'Removed from watchlist' };
  }
}
