import { Module } from '@nestjs/common';
import { DateRangesController } from './date-ranges.controller.js';
import { DateRangesService } from './date-ranges.service.js';

@Module({
  controllers: [DateRangesController],
  providers: [DateRangesService],
})
export class DateRangesModule {}
