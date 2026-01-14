import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayContentDto } from './dto-content/play.dto';
import { PauseContentDto } from './dto-content/pause.dto';
import { ViewingSessionService } from '../viewing-session/viewing-session.service';

@Injectable()
export class ContentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly viewingSessionService: ViewingSessionService,
  ) {}

  async play(dto: PlayContentDto) {
    return this.viewingSessionService.startViewingSession(dto);
  }

  async pause(dto: PauseContentDto) {
    return this.viewingSessionService.saveViewingProgress(dto);
  }

  async resume(profileId: number, contentId: number) {
    return this.viewingSessionService.getViewingProgress(profileId, contentId);
  }

  async currentlyWatching(profileId: number) {
    return this.viewingSessionService.getCurrentlyWatching(profileId);
  }

  async getAllContent() {
    return this.dataSource.query(`SELECT * FROM content`);
  }

  async getContentById(contentId: number) {
    const result = await this.dataSource.query(
      `SELECT * FROM content WHERE content_id = $1`,
      [contentId],
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
      [ageCategoryId],
    );
  }

  async getPersonalisedContent(profileId: number) {
    const query = `
      SELECT DISTINCT
        c.content_id,
        c.title,
        c.description,
        'MOVIE' as type,
        q.name as quality_name
      FROM content c
      JOIN profile p ON p.profile_id = $1
      JOIN quality q ON q.quality_id = c.quality_id
      WHERE c.content_type = 'MOVIE'
        AND c.age_category_id <= p.age_category_id
        AND (
          NOT EXISTS (
            SELECT 1
            FROM profile_genre_preference pgp
            WHERE pgp.profile_id = $1
          )
          OR c.content_id IN (
            SELECT cg.content_id
            FROM content_genre cg
            JOIN profile_genre_preference pgp ON pgp.genre_id = cg.genre_id
            WHERE pgp.profile_id = $1
          )
        )

      UNION

      SELECT DISTINCT
        s.series_id as content_id,
        s.name as title,
        null as description,
        'SERIES' as type,
        null as quality_name
      FROM series s
      WHERE NOT EXISTS (
        SELECT 1
        FROM profile_genre_preference pgp
        WHERE pgp.profile_id = $1
      )
      OR s.series_id IN (
        SELECT sg.series_id
        FROM series_genre sg
        JOIN profile_genre_preference pgp ON pgp.genre_id = sg.genre_id
        WHERE pgp.profile_id = $1
      )
      ORDER BY title;
    `;

    return this.dataSource.query(query, [profileId]);
  }
}
