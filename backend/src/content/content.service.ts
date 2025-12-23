import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayContentDto } from './dto-content/play.dto';
import { PauseContentDto } from './dto-content/pause.dto';

@Injectable()
export class ContentService {
  constructor(private readonly dataSource: DataSource) {}

  async startViewingSession(dto: PlayContentDto) {
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
        start_timestamp = NOW()
      RETURNING *;
    `;

    const result = await this.dataSource.query(query, [
      dto.profileId,
      dto.contentId,
    ]);

    return result[0];
  }

  async saveViewingProgress(dto: PauseContentDto) {
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
    completed,              // 👈 here
    dto.autoContinuedNext,
  ]);
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

  async getAllContent() {
    return this.dataSource.query(`SELECT * FROM content`);
  }

  async getContentById(contentId: number) {
    const result = await this.dataSource.query(
      `SELECT * FROM content WHERE content_id = $1`,
      [contentId]
    );

    return result[0] || null;
  }

  async getContentBasedOnAgeRating(ageCategoryId: number) {
    return this.dataSource.query(
      `
      SELECT *
      FROM content
      WHERE age_category_id <= $1
      ORDER BY age_category_id DESC
      `,
      [ageCategoryId]
    );
  }

  async getPersonalisedContent(profileId: number) {
  const query = `
    SELECT c.*
    FROM content c
    JOIN profile p ON p.profile_id = $1
    JOIN quality q ON q.quality_id = c.quality_id
    WHERE c.age_category_id <= p.age_category_id
      AND q.quality_id <= (
        SELECT quality_id FROM quality WHERE name = p.min_quality
      )
    ORDER BY c.title;
  `;

  return this.dataSource.query(query, [profileId]);
}
}