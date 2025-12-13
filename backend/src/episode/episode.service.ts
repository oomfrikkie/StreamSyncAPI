import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EpisodeService {
  constructor(private readonly dataSource: DataSource) {}

  async getAllEpisodes() {
    const query = `
      SELECT
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

  async getEpisodesBySeries(seriesId: number) {
    const query = `
      SELECT
        c.content_id,
        c.title,
        e.episode_number,
        e.duration_minutes,
        s.season_number
      FROM episode e
      JOIN content c ON c.content_id = e.content_id
      JOIN season s ON s.season_id = e.season_id
      WHERE s.series_id = $1
      ORDER BY s.season_number, e.episode_number;
    `;

    return this.dataSource.query(query, [seriesId]);
  }
}
