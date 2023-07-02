import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { UsersService } from 'src/users/users.service';
import { RoomsService } from 'src/rooms/rooms.service';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, UsersService, RoomsService],
})
export class ReservationsModule {}
