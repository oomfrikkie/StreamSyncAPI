import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  async getMembers() {
    const result = await this.dataSource.query('SELECT * FROM "projectmembers"');
    return result;
  }
}
