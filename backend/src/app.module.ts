import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AccountModule } from './account/account.module';
import { AccountTokenModule } from './account/token/account-token.module';
import { ProfileModule } from './profile/profile.module';
import { ContentModule } from './content/content.module';
import { EpisodeModule } from './episode/episode.modules'; 
import { SeriesModule } from './series/series.modules';
import { SeasonModule } from './season/season.modules';
import { WatchlistModule } from './watchlist/watchlist.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.POSTGRES_PORT!, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: false,
      logging: ['query', 'error'],
    }),

    AccountModule,
    AccountTokenModule,
    ProfileModule,
    ContentModule,
    EpisodeModule,
    SeriesModule,
    SeasonModule,
    WatchlistModule,
  ],
})
export class AppModule {}
