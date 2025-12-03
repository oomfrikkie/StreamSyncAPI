import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  async getMembers() {
    const result = await this.dataSource.query('SELECT * FROM "projectmembers"');
    return result;
  }

  async getQualities() {
    const result = await this.dataSource.query('SELECT * FROM "quality"');
    return result;
  }

  async getApiUserAccounts() {
    const result = await this.dataSource.query('SELECT * FROM "api_user_account"');
    return result;
  }

  async getAccounts() {
    const result = await this.dataSource.query('SELECT * FROM "account"');
    return result;
  }

  async getAccountSubscriptions() {
    const result = await this.dataSource.query('SELECT * FROM "account_subscription"');
    return result;
  }

  async getInvitations() {
    const result = await this.dataSource.query('SELECT * FROM "invitation"');
    return result;
  }

  async getProfiles() {
    const result = await this.dataSource.query('SELECT * FROM "profile"');
    return result;
  }

  async getAgeCategories() {
    const result = await this.dataSource.query('SELECT * FROM "age_category"');
    return result;
  }

  async getProfileGenrePreferences() {
    const result = await this.dataSource.query('SELECT * FROM "profile_genre_preference"');
    return result;
  }

  async getGenres() {
    const result = await this.dataSource.query('SELECT * FROM "genre"');
    return result;
  }
}
