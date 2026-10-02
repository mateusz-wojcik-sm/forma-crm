import { Module } from '@nestjs/common';
import { config } from './config';
import { RecordsController } from './records/records.controller';
import { DATABASE_OPTIONS, RecordsRepository } from './records/records.repository';
import { RecordsService } from './records/records.service';

@Module({
  controllers: [RecordsController],
  providers: [
    { provide: DATABASE_OPTIONS, useValue: { path: config.databasePath } },
    RecordsRepository,
    RecordsService,
  ],
})
export class AppModule {}
