import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayViewingSessionDto } from './dto-viewing-session/play.dto';
import { PauseViewingSessionDto } from './dto-viewing-session/pause.dto';

@Injectable()
export class ViewingSessionService {
  constructor(private readonly dataSource: DataSource) {}

    async startViewingSession(dto: PlayViewingSessionDto) {
    const query = `
      INSERT INTO viewing_session
        (
          profile_id,
          content_id,
          last_position_seconds,
          watched_seconds,
          completed,
          auto_continued_next,
          start_timestamp
        )
      VALUES ($1, $2, 0, 0, false, false, NOW())
      ON CONFLICT (profile_id, content_id)
      DO UPDATE SET
        start_timestamp = NOW(),
        completed = FALSE
      RETURNING *;
    `;
    const result = await this.dataSource.query(query, [
      dto.profileId,
      dto.contentId,
    ]);
    return result[0];
  }

  async saveViewingProgress(dto: PauseViewingSessionDto) {
    const completed =
      dto.lastPositionSeconds / dto.durationSeconds >= 0.95;
    const query = `
      INSERT INTO viewing_session
        (
          profile_id,
          content_id,
          last_position_seconds,
          watched_seconds,
          completed,
          auto_continued_next,
          start_timestamp
        )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (profile_id, content_id)
      DO UPDATE SET
        last_position_seconds = EXCLUDED.last_position_seconds,
        watched_seconds = EXCLUDED.watched_seconds,
        completed = EXCLUDED.completed,
        auto_continued_next = EXCLUDED.auto_continued_next,
        start_timestamp = NOW();
    `;
    await this.dataSource.query(query, [
      dto.profileId,
      dto.contentId,
      dto.lastPositionSeconds,
      dto.watchedSeconds,
      completed,
      dto.autoContinuedNext,
    ]);
    return { message: 'Progress saved' };
  }

  async getViewingProgress(profileId: number, contentId: number) {
    const query = `
      SELECT
        last_position_seconds,
        watched_seconds,
        completed,
        auto_continued_next
      FROM viewing_session
      WHERE profile_id = $1
        AND content_id = $2
      ORDER BY start_timestamp DESC
      LIMIT 1;
    `;
    const result = await this.dataSource.query(query, [
      profileId,
      contentId,
    ]);
    return result[0] || null;
  }

  async getCurrentlyWatching(profileId: number) {
    const query = `
      SELECT
        c.content_id,
        c.title,
        vs.last_position_seconds,
        vs.watched_seconds,
        vs.start_timestamp
      FROM viewing_session vs
      JOIN content c ON c.content_id = vs.content_id
      WHERE vs.profile_id = $1
        AND vs.completed = false
      ORDER BY vs.start_timestamp DESC;
    `;
    return this.dataSource.query(query, [profileId]);
  }
}
