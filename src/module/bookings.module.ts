import { Module } from '@nestjs/common';
import { BookingsController } from '../controller/bookings.controller';
import { BookingsService } from '../service/bookings.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';
import { Reservations, ReservationsSchema } from '../dto/schemas/reservations.schema';
import { ReserveSection, ReserveSectionSchema } from '../dto/schemas/reserve-section.schema';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      {name: LoginToken.name, schema: LoginTokenSchema},
      {name: Reservations.name, schema: ReservationsSchema},
      {name: ReserveSection.name, schema: ReserveSectionSchema},
    ])
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
