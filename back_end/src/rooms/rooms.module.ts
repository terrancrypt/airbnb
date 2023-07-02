import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { UsersService } from 'src/users/users.service';


@Module({
  controllers: [RoomsController],
  providers: [RoomsService, UsersService]
})
export class RoomsModule {}
