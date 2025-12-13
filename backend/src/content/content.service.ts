import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayContentDto } from './dto-content/play.dto';
import { PauseContentDto } from './dto-content/pause.dto';

@Injectable()
export class ContentService {
  constructor(private readonly dataSource: DataSource) {}

  // ▶️ Start / create viewing session
  async startViewingSession(dto: PlayContentDto) {
    const checkQuery = `
      SELECT *
      FROM viewing_session
      WHERE profile_id = $1
        AND content_id = $2
      LIMIT 1;
    `;

    const existing = await this.dataSource.query(checkQuery, [
      dto.profileId,
      dto.contentId,
    ]);

    if (existing.length > 0) {
      return existing[0];
    }

    const insertQuery = `
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
      RETURNING *;
    `;

    const result = await this.dataSource.query(insertQuery, [
      dto.profileId,
      dto.contentId,
    ]);

    return result[0];
  }

  // ⏸ Save viewing progress (pause)
  async saveViewingProgress(dto: PauseContentDto) {
    const query = `
      UPDATE viewing_session
      SET
        last_position_seconds = $3,
        watched_seconds = $4,
        completed = $5,
        auto_continued_next = $6,
        start_timestamp = NOW()
      WHERE profile_id = $1
        AND content_id = $2;
    `;

    await this.dataSource.query(query, [
      dto.profileId,
      dto.contentId,
      dto.lastPositionSeconds,
      dto.watchedSeconds,
      dto.completed,
      dto.autoContinuedNext,
    ]);
  }

  // ▶️ Resume progress
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

  // Get ALL content
  async getAllContent() {
    return this.dataSource.query(`SELECT * FROM content`);
  }

  // Get content by ID
  async getContentById(contentId: number) {
    const result = await this.dataSource.query(
      `SELECT * FROM content WHERE content_id = $1`,
      [contentId]
    );

    return result[0] || null;
  }

  // Get content allowed for age category
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
}
