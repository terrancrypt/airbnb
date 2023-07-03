import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { UsersService } from 'src/users/users.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { ReservationsService } from 'src/reservations/reservations.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, UsersService, RoomsService, ReservationsService]
})
export class ReviewsModule {}
