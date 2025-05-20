import { Module } from '@nestjs/common';
import { BookingsController } from '../controller/bookings.controller';
import { BookingsService } from '../service/bookings.service';

@Module({
  imports: [],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
