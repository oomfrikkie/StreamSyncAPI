import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SeasonService {
  constructor(private readonly dataSource: DataSource) {}

  async getSeasonsBySeries(seriesId: number) {
    const query = `
      SELECT
        season_id,
        season_number
      FROM season
      WHERE series_id = $1
      ORDER BY season_number;
    `;

    return this.dataSource.query(query, [seriesId]);
  }
}
