import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

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
        e.episode_number,
        e.duration_minutes,
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
}
