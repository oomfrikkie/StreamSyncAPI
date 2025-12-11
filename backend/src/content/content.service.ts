import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ContentService {
  constructor(private readonly dataSource: DataSource) {}

  // Save or update viewing progress (pause)
  async saveViewingProgress(
    profileId: number,
    contentId: number,
    episodeId: number | null,
    lastPositionSeconds: number,
    watchedSeconds: number,
    completed: boolean,
    autoContinuedNext: boolean = false
  ) {
    const query = `
      INSERT INTO viewing_session 
        (profile_id, content_id, episode_id, last_position_seconds, watched_seconds, completed, auto_continued_next)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (profile_id, content_id, episode_id)
      DO UPDATE SET 
        last_position_seconds = $4,
        watched_seconds = $5,
        completed = $6,
        auto_continued_next = $7,
        start_timestamp = NOW();
    `;

    await this.dataSource.query(query, [
      profileId,
      contentId,
      episodeId,
      lastPositionSeconds,
      watchedSeconds,
      completed,
      autoContinuedNext
    ]);
  }

  // Resume progress
  async getViewingProgress(
    profileId: number,
    contentId: number,
    episodeId: number | null
  ) {
    const query = `
      SELECT last_position_seconds, watched_seconds, completed, auto_continued_next
      FROM viewing_session
      WHERE profile_id = $1
        AND content_id = $2
        AND (
          ($3 IS NULL AND episode_id IS NULL)
          OR (episode_id = $3)
        )
      ORDER BY start_timestamp DESC
      LIMIT 1;
    `;

    const result = await this.dataSource.query(query, [
      profileId,
      contentId,
      episodeId
    ]);

    return result[0] || null;
  }

  // Get ALL content
  async getAllContent() {
    return await this.dataSource.query(`SELECT * FROM content`);
  }

  // Get content by ID
  async getContentById(contentId: number) {
    const result = await this.dataSource.query(
      `SELECT * FROM content WHERE content_id = $1`,
      [contentId]
    );

    return result[0] || null;
  }
}
