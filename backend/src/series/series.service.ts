import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SeriesService {
  constructor(private readonly dataSource: DataSource) {}

  async getAllSeries() {
    const query = `
      SELECT series_id, name
      FROM series
      ORDER BY name;
    `;
    return this.dataSource.query(query);
  }

  async getSeriesById(seriesId: number) {
    const result = await this.dataSource.query(
      `
      SELECT series_id, name
      FROM series
      WHERE series_id = $1
      `,
      [seriesId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Series not found');
    }

    return result[0];
  }

  async getEpisodesBySeriesId(seriesId: number) {
  const query = `
    SELECT
      e.episode_id,
      c.content_id,
      c.title,
      c.duration_minutes,
      e.episode_number,
      s.season_number
    FROM season s
    JOIN episode e ON e.season_id = s.season_id
    JOIN content c ON c.content_id = e.content_id
    WHERE s.series_id = $1
    ORDER BY s.season_number, e.episode_number;
  `;

  return this.dataSource.query(query, [seriesId]);
}

}
