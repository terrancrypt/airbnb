import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RoomsService } from 'src/rooms/rooms.service';
import { DataRespone } from 'src/types';
import { reservations, rooms, users } from '@prisma/client';
import { ResponeAReser, ResponeResers } from './types';
import { JwtPayload } from 'src/auth/types';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaSevice,
    private userService: UsersService,
    private roomService: RoomsService,
  ) {}

  async postCreateReservation(
    userId: number,
    dataBooking: CreateBookingDto,
  ): Promise<ResponeAReser> {
    const room: rooms = await this.roomService.findUniqueRoomInDB(
      dataBooking.roomId,
    );

    if (!room) throw new NotFoundException('Room not found.');

    const dataReservation: reservations = await this.createRevervationInDB(
      userId,
      dataBooking,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Booking successful!',
      data: dataReservation,
    };
  }

  async getAllRevervations(): Promise<ResponeResers> {
    try {
      const reservations: reservations[] =
        await this.prisma.reservations.findMany({});

      return {
        statusCode: HttpStatus.OK,
        message: 'Success!',
        data: reservations,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getUniqueResvervation(reservationId: number): Promise<ResponeAReser> {
    const existingResers: reservations = await this.findUniqueReservation(
      reservationId,
    );
    if (!existingResers) throw new NotFoundException('No booking found.');

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data: existingResers,
    };
  }

  async getAllByUserId(userId: number): Promise<ResponeResers> {
    const user: users = await this.userService.findUniqueUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const dataReservations: reservations[] =
      await this.findManyReservationByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data: dataReservations,
    };
  }

  async putUpdateReservation(
    revervationId: number,
    newBookingData: CreateBookingDto,
  ): Promise<ResponeAReser> {
    const existingResers: reservations = await this.findUniqueReservation(
      revervationId,
    );
    if (!existingResers) throw new NotFoundException('No booking found.');

    const dataUpdate = await this.updateReveservationInDB(
      revervationId,
      newBookingData,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Update success!',
      data: dataUpdate,
    };
  }

  async deleteReservation(
    user: JwtPayload,
    reservationId: number,
  ): Promise<void> {
    const existingResers: reservations = await this.findUniqueReservation(
      reservationId,
    );

    if (!existingResers)
      throw new NotFoundException('Reservation does not exist!');

      console.log(user.role);

    if (user.role === Role.Admin || user.sub === existingResers.user_id) {
      await this.deleteResersInDB(reservationId);

    } else {
      throw new ForbiddenException(
        `You do not have permission to delete this room.`,
      );
    }
  }

  // =========== Database Methods ================
  async createRevervationInDB(
    userId: number,
    dataBooking: CreateBookingDto,
  ): Promise<reservations> {
    try {
      const dataReservation = await this.prisma.reservations.create({
        data: {
          start_date: new Date(dataBooking.startDate),
          end_date: new Date(dataBooking.endDate),
          total_guests: dataBooking.totalGuests,
          price: dataBooking.price,
          users: {
            connect: {
              id: userId,
            },
          },
          rooms: {
            connect: {
              id: dataBooking.roomId,
            },
          },
        },
      });

      return dataReservation;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findManyReservationByUserId(userId: number): Promise<reservations[]> {
    try {
      const dataRevervations = await this.prisma.reservations.findMany({
        where: {
          user_id: userId,
        },
      });

      return dataRevervations;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findUniqueReservation(reservationId: number): Promise<reservations> {
    try {
      const dataResers = await this.prisma.reservations.findUnique({
        where: {
          id: reservationId,
        },
      });

      return dataResers;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async updateReveservationInDB(
    reservationId: number,
    newDataResers: CreateBookingDto,
  ): Promise<reservations> {
    try {
      const dataResers = await this.prisma.reservations.update({
        where: {
          id: reservationId,
        },
        data: {
          start_date: new Date(newDataResers.startDate),
          end_date: new Date(newDataResers.endDate),
          total_guests: newDataResers.totalGuests,
          price: newDataResers.price,
        },
      });
      return dataResers;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async deleteResersInDB(reservationId: number) {
    try {
      await this.prisma.reservations.delete({
        where: {
          id: reservationId,
        },
      });

      return true;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
