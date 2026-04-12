import { Injectable, BadRequestException } from '@nestjs/common';
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
    try {
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
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new BadRequestException('Invalid ID: series_id, age_category_id or quality_id does not exist');
      }
      throw error;
    }
    const result = await this.dataSource.query(
      `SELECT e.episode_id, c.* FROM episode e JOIN content c ON e.content_id = c.content_id WHERE c.title = $1 ORDER BY e.episode_id DESC LIMIT 1`,
      [dto.title]
    );
    return result[0] || null;
  }
}
