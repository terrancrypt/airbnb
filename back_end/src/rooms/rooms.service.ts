import { Injectable, InternalServerErrorException, UnauthorizedException,NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { resRoomCreated } from './types/resRoomCreated.type';
import { rooms, users } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaSevice) {}

  async createRoom(
    userId: number,
    newRoomData: CreateRoomDto,
  ): Promise<resRoomCreated> {
    try {
      const {
        title,
        max_guests,
        total_bedrooms,
        total_beds,
        total_bathrooms,
        description,
        price,
        has_tv,
        has_kitchen,
        has_air_con,
        has_wifi,
        has_washer,
        has_iron,
        has_pool,
        has_parking,
        pets_allowed,
        latitude,
        longtitude,
        primary_img,
        street,
        state,
        city,
        country,
        room_type,
      } = newRoomData;
      const address = await this.prisma.room_address.create({
        data: {
          street,
          state,
          city,
          country,
        },
      });

      const dataNewRoom = await this.prisma.rooms.create({
        data: {
          title,
          max_guests,
          total_bedrooms,
          total_beds,
          total_bathrooms,
          description,
          price,
          has_tv,
          has_kitchen,
          has_air_con,
          has_wifi,
          has_washer,
          has_iron,
          has_pool,
          has_parking,
          pets_allowed,
          create_at: new Date(),
          update_at: new Date(),
          primary_img,
          room_address_id: address.id,
          room_type,
          owner_id: userId,
        },
      });

      return {
        message: 'Successfully created new room!',
        data: dataNewRoom,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async uploadRoomImage(userId: number, file: Express.Multer.File, roomId: number) {
    try {
      const user: users = await this.prisma.users.findUnique({
        where:{
          id: userId
        }
      })
      if (!user) throw new UnauthorizedException()
      
      const room: rooms = await this.prisma.rooms.findUnique({
        where:{
          id: roomId
        }
      })
      if(!room) throw new NotFoundException("Room does not exist!")


    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
