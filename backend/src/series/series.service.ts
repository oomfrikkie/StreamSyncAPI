import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SeriesService {
  constructor(private readonly dataSource: DataSource) {}

  async getAllSeries() {
    const query = `
      SELECT
        series_id,
        name
      FROM series
      ORDER BY name;
    `;

    return this.dataSource.query(query);
  }
}
