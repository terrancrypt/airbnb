import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { room_address, room_images, rooms, users } from '@prisma/client';
import { FirebaseService } from 'src/firebase/firebase.service';
import { DataRespone } from 'src/types';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/enums/role.enum';
import { ResponeARoom, ResponeRooms, ResponeUploadRoomImg } from './types';
import { JwtPayload } from 'src/auth/types';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaSevice,
    private firebase: FirebaseService,
    private userService: UsersService,
  ) {}

  async getAllRooms(): Promise<ResponeRooms> {
    try {
      const dataRooms: rooms[] = await this.prisma.rooms.findMany({
        include: {
          room_address: true,
          room_images: true,
          room_types: true,
          places: true,
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

  async getRoomById(id: number): Promise<ResponeARoom> {
    const dataRooms: rooms = await this.findUniqueRoomInDB(id);

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
  ): Promise<ResponeRooms> {
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

    const dataRooms: rooms[] = await this.findRoomsPaginated(page, pageSize);

    return {
      statusCode: 200,
      message: `Get page ${page} with ${pageSize} rooms successfully!`,
      data: dataRooms,
    };
  }

  async getRoomsByAddress(keyword: string): Promise<ResponeRooms> {
    try {
      const dataRooms: rooms[] = await this.prisma.rooms.findMany({
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
          places: true,
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

  async postCreateRoom(
    userId: number,
    newRoomData: CreateRoomDto,
  ): Promise<ResponeARoom> {
    try {
      const {
        title,
        maxGuests,
        totalBedrooms,
        totalBeds,
        totalBathrooms,
        description,
        price,
        hasTv,
        hasKitchen,
        hasAirConditioner,
        hasWifi,
        hasWasher,
        hasIron,
        hasPool,
        hasParking,
        petsAllowed,
        street,
        state,
        city,
        country,
        roomType,
        placeId,
      } = newRoomData;

      const address: room_address = await this.prisma.room_address.create({
        data: {
          street,
          state,
          city,
          country,
        },
      });

      const dataNewRoom: rooms = await this.prisma.rooms.create({
        data: {
          title,
          max_guests: maxGuests,
          total_bedrooms: totalBedrooms,
          total_beds: totalBeds,
          total_bathrooms: totalBathrooms,
          description,
          price,
          has_tv: hasTv,
          has_kitchen: hasKitchen,
          has_air_con: hasAirConditioner,
          has_wifi: hasWifi,
          has_washer: hasWasher,
          has_iron: hasIron,
          has_pool: hasPool,
          has_parking: hasParking,
          pets_allowed: petsAllowed,
          create_at: new Date(),
          update_at: new Date(),
          room_address: {
            connect: {
              id: address.id,
            },
          },
          room_types: {
            connect: {
              id: roomType,
            },
          },
          users: {
            connect: {
              id: userId,
            },
          },
          places:{
            connect: {
              id: placeId
            }
          }
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
  ): Promise<ResponeARoom> {
    const existingRoom: rooms = await this.findUniqueRoomInDB(roomId);

    if (!existingRoom) {
      throw new NotFoundException(`Room with id ${roomId} not found.`);
    }

    if (existingRoom.owner_id !== userId) {
      throw new UnauthorizedException("You can't edit someone else's room!");
    }

    const roomDataUpdated: rooms = await this.updateRoomInDB(
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

  async deleteRoom(user: JwtPayload, roomId: number): Promise<DataRespone> {
    const existingRoom: rooms = await this.findUniqueRoomInDB(roomId);

    if (!existingRoom) {
      throw new NotFoundException(`Room with id ${roomId} not found.`);
    }

    if (user.role === Role.Admin || existingRoom.owner_id === user.sub) {
      await this.deleteRoomInDB(roomId);

      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Delete room successfully!',
      };
    } else {
      throw new ForbiddenException(
        'You do not have permission to delete this room.',
      );
    }
  }

  async uploadRoomImage(
    userId: number,
    file: Express.Multer.File,
    roomId: number,
  ): Promise<ResponeUploadRoomImg> {
    const user: users = await this.userService.findUniqueUserById(userId);
    if (!user)
      throw new UnauthorizedException(
        `You can't upload photos of other people's rooms!`,
      );

    const room: rooms = await this.findUniqueRoomInDB(roomId);
    if (!room) throw new NotFoundException('Room does not exist!');

    const urlImage = await this.firebase.FirebaseUpload(file);

    const imgData: room_images = await this.createRoomImageInDB(
      roomId,
      urlImage,
    );

    const roomImg: string = await this.getRoomPrimaryImg(roomId);

    if (!roomImg) {
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
  }

  // =========== Database Methods ================

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
          places: true,
        },
      });

      return room;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findRoomsPaginated(page: number, pageSize: number): Promise<rooms[]> {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      const data: rooms[] = await this.prisma.rooms.findMany({
        skip,
        take,
        include: {
          room_address: true,
          room_images: true,
        },
      });

      return data;
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
        maxGuests,
        totalBedrooms,
        totalBeds,
        totalBathrooms,
        description,
        price,
        hasTv,
        hasKitchen,
        hasAirConditioner,
        hasWifi,
        hasWasher,
        hasIron,
        hasPool,
        hasParking,
        petsAllowed,
        street,
        state,
        city,
        country,
        roomType,
        placeId
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
          max_guests: maxGuests,
          total_bedrooms: totalBedrooms,
          total_beds: totalBeds,
          total_bathrooms: totalBathrooms,
          description,
          price,
          has_tv: hasTv,
          has_kitchen: hasKitchen,
          has_air_con: hasAirConditioner,
          has_wifi: hasWifi,
          has_washer: hasWasher,
          has_iron: hasIron,
          has_pool: hasPool,
          has_parking: hasParking,
          pets_allowed: petsAllowed,
          create_at: new Date(),
          update_at: new Date(),
          room_types: {
            connect: {
              id: roomType,
            },
          },
          places:{
            connect: {
              id: placeId
            }
          }
        },
      });

      return roomDataUpdated;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async createRoomImageInDB(
    roomId: number,
    urlImg: string,
  ): Promise<room_images> {
    try {
      const room_img = await this.prisma.room_images.create({
        data: {
          rooms: {
            connect: {
              id: roomId,
            },
          },
          url_img: urlImg,
        },
      });
      return room_img;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getRoomPrimaryImg(roomId: number): Promise<string> {
    try {
      const roomImg = await this.prisma.rooms.findUnique({
        where: {
          id: roomId,
        },
        select: {
          primary_img: true,
        },
      });

      return roomImg.primary_img;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
