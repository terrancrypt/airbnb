import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { room_images, rooms, users } from '@prisma/client';
import { FirebaseService } from 'src/firebase/firebase.service';
import { DataRespone } from 'src/types';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaSevice,
    private firebase: FirebaseService,
  ) {}

  async getAll(): Promise<DataRespone & { data: rooms[] }> {
    try {
      const dataRooms = await this.prisma.rooms.findMany({
        include: {
          room_address: true,
          room_images: true,
          room_types: true,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Get all room successfully!',
        data: dataRooms,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getRoomById(id: number): Promise<DataRespone & { data: rooms }> {
    const dataRooms = await this.findUniqueRoomInDB(id);

    if (!dataRooms) {
      throw new NotFoundException('Room not found.');
    }

    return {
      statusCode: HttpStatus.OK,
      message: `Get room with id is ${id} successful!`,
      data: dataRooms,
    };
  }

  async getRoomsPaginated(
    page: number,
    pageSize: number,
  ): Promise<DataRespone & { data: rooms[] }> {
    try {
      if (!page && page < 1) {
        throw new BadRequestException(
          'Invalid value for page. Page must be a positive integer.',
        );
      }

      if (!pageSize && pageSize < 1) {
        throw new BadRequestException(
          'Invalid value for pageSize. Page must be a positive integer.',
        );
      }

      const dataRooms = await this.findRoomPaginatedInDB(page, pageSize);

      return {
        statusCode: 200,
        message: `Get page ${page} with ${pageSize} rooms successfully!`,
        data: dataRooms,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getRoomsByAddress(
    keyword: string,
  ): Promise<DataRespone & { data: rooms[] }> {
    try {
      const dataRooms = await this.prisma.rooms.findMany({
        where: {
          room_address: {
            OR: [
              { street: { contains: keyword } },
              { state: { contains: keyword } },
              { city: { contains: keyword } },
              { country: { contains: keyword } },
            ],
          },
        },
        include: {
          room_images: true,
          room_address: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: `Get rooms in ${keyword} successfully!`,
        data: dataRooms,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async createRoom(
    userId: number,
    newRoomData: CreateRoomDto,
  ): Promise<DataRespone & { data: rooms }> {
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
          room_address_id: address.id,
          room_type,
          owner_id: userId,
        },
      });
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Successfully created new room!',
        data: dataNewRoom,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async updateRoom(
    userId: number,
    roomId: number,
    roomUpdateData: CreateRoomDto,
  ): Promise<DataRespone & { data: rooms }> {
    const existingRoom = await this.findUniqueRoomInDB(roomId);

    if (!existingRoom) {
      throw new NotFoundException(`Room with id ${roomId} not found.`);
    }

    if (existingRoom.owner_id !== userId) {
      throw new UnauthorizedException("You can't edit someone else's room!");
    }

    const roomDataUpdated = await this.updateRoomInDB(
      existingRoom,
      roomId,
      roomUpdateData,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Update room with id ${roomId} successfully!`,
      data: roomDataUpdated,
    };
  }

  async deleteRoom(userId: number, roomId: number): Promise<DataRespone> {
    const existingRoom = await this.findUniqueRoomInDB(roomId);

    if (!existingRoom) {
      throw new NotFoundException(`Room with id ${roomId} not found.`);
    }

    if (existingRoom.owner_id !== userId) {
      throw new UnauthorizedException("You can't delete someone else's room!");
    }

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Delete room successfully!',
    };
  }

  async uploadRoomImage(
    userId: number,
    file: Express.Multer.File,
    roomId: number,
  ): Promise<DataRespone & { data: room_images }> {
    try {
      const user: users = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) throw new UnauthorizedException();

      const room: rooms = await this.prisma.rooms.findUnique({
        where: {
          id: roomId,
        },
      });
      if (!room) throw new NotFoundException('Room does not exist!');

      const urlImage = await this.firebase.FirebaseUpload(file);

      const imgData: room_images = await this.prisma.room_images.create({
        data: {
          room_id: roomId,
          url_img: urlImage,
        },
      });

      const roomImg = await this.prisma.rooms.findUnique({
        where: {
          id: roomId,
        },
        select: {
          primary_img: true,
        },
      });

      if (!roomImg.primary_img) {
        await this.prisma.rooms.updateMany({
          where: {
            id: roomId,
          },
          data: {
            primary_img: urlImage,
          },
        });
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Upload image successfully!',
        data: imgData,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  // =========== Database Functionals ================

  async findUniqueRoomInDB(roomId: number): Promise<rooms> {
    try {
      const room: rooms = await this.prisma.rooms.findUnique({
        where: {
          id: roomId,
        },
        include: {
          room_images: true,
          room_address: true,
          room_types: true,
        },
      });

      return room;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findRoomPaginatedInDB(
    page: number,
    pageSize: number,
  ): Promise<rooms[]> {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      const dataRooms = await this.prisma.rooms.findMany({
        skip,
        take,
        include: {
          room_address: true,
          room_images: true,
        },
      });

      return dataRooms;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async deleteRoomInDB(roomId: number): Promise<void> {
    try {
      await this.prisma.rooms.delete({
        where: {
          id: roomId,
        },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async updateRoomInDB(
    existingRoom: rooms,
    roomId: number,
    roomUpdateData: CreateRoomDto,
  ): Promise<rooms> {
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
        street,
        state,
        city,
        country,
        room_type,
      } = roomUpdateData;

      await this.prisma.room_address.update({
        where: {
          id: existingRoom.room_address_id,
        },
        data: {
          street,
          state,
          city,
          country,
        },
      });

      const roomDataUpdated = await this.prisma.rooms.update({
        where: {
          id: roomId,
        },
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
          update_at: new Date(),
          primary_img: existingRoom.primary_img,
          room_type,
        },
      });

      return roomDataUpdated;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
