import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SeasonService {
  constructor(private readonly dataSource: DataSource) {}

  async getAllSeasons() {
  const query = `
    SELECT
      s.season_id,
      s.series_id,
      sr.name AS series_name,
      s.season_number
    FROM season s
    JOIN series sr ON sr.series_id = s.series_id
    ORDER BY s.series_id, s.season_number;
  `;

  return this.dataSource.query(query);
}


  async getEpisodes(seasonId: number) {
    const query = `
      SELECT
        e.episode_id,
        e.episode_number,
        c.title,
        c.duration_minutes,
        c.content_id,
        c.description
      FROM episode e
      JOIN content c ON c.content_id = e.content_id
      WHERE e.season_id = $1
      ORDER BY e.episode_number;
    `;

    return this.dataSource.query(query, [seasonId]);
  }
}
