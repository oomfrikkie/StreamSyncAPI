import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quality } from './quality.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quality])],
  exports: [TypeOrmModule], // 👈 important
})
export class QualityModule {}
