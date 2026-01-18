import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateEpisodeDto } from './dto-episode/create-episode.dto';

@Injectable()
export class EpisodeService {
  constructor(private readonly dataSource: DataSource) {}

  // Global list (admin / overview / debug use)
  async getAllEpisodes() {
    const query = `
      SELECT
        e.episode_id,
        c.content_id,
        c.title,
        c.duration_minutes,
        e.episode_number,
        s.season_number,
        se.name AS series_name
      FROM episode e
      JOIN content c ON c.content_id = e.content_id
      JOIN season s ON s.season_id = e.season_id
      JOIN series se ON se.series_id = s.series_id
      ORDER BY se.name, s.season_number, e.episode_number;
    `;

    return this.dataSource.query(query);
  }

  async createEpisode(dto: CreateEpisodeDto) {
    // 1. Look up or create the season
    let season = await this.dataSource.query(
      `SELECT season_id FROM season WHERE series_id = $1 AND season_number = $2`,
      [dto.series_id, dto.season_number]
    );
    let season_id: number;
    if (season.length > 0) {
      season_id = season[0].season_id;
    } else {
      const inserted = await this.dataSource.query(
        `INSERT INTO season (series_id, season_number) VALUES ($1, $2) RETURNING season_id`,
        [dto.series_id, dto.season_number]
      );
      season_id = inserted[0].season_id;
    }

    // 2. Create the episode using the correct procedure
    await this.dataSource.query(
      `SELECT create_episode_with_season($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        dto.series_id,
        dto.season_number,
        dto.episode_number,
        dto.title,
        dto.description,
        dto.age_category_id,
        dto.quality_id,
        dto.duration_minutes,
      ]
    );
    // Optionally, return the newly created episode (fetch by title or other unique field)
    const result = await this.dataSource.query(
      `SELECT e.episode_id, c.* FROM episode e JOIN content c ON e.content_id = c.content_id WHERE c.title = $1 ORDER BY e.episode_id DESC LIMIT 1`,
      [dto.title]
    );
    return result[0] || null;
  }
}
