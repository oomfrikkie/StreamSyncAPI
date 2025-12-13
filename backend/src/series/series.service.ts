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

  async getEpisodesBySeriesId(
    profileId: number,
    seriesId: number,
  ) {
    const query = `
      SELECT
        e.content_id,
        c.title,
        e.episode_number,
        e.duration_minutes,
        s.season_number,
        vs.last_position_seconds
      FROM season s
      JOIN episode e ON e.season_id = s.season_id
      JOIN content c ON c.content_id = e.content_id
      LEFT JOIN viewing_session vs
        ON vs.content_id = e.content_id
       AND vs.profile_id = $1
      WHERE s.series_id = $2
      ORDER BY s.season_number, e.episode_number;
    `;

    return this.dataSource.query(query, [profileId, seriesId]);
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
      throw new NotFoundException("Series not found");
    }

    return result[0];
  }
}
