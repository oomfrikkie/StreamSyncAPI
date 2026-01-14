import { Module } from '@nestjs/common';
import { ViewingSessionController } from './viewing-session.controller';
import { ViewingSessionService } from './viewing-session.service';

@Module({
  controllers: [ViewingSessionController],
  providers: [ViewingSessionService],
  exports: [ViewingSessionService],
})
export class ViewingSessionModule {}