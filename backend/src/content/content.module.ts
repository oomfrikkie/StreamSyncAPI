import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Content } from './content.entity';
import { Quality } from './quality/quality.entity';

import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ViewingSessionModule } from '../viewing-session/viewing-session.module';

@Module({
  imports: [TypeOrmModule.forFeature([Content, Quality]), ViewingSessionModule],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
