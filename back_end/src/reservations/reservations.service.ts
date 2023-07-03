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
import { reservations } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaSevice,
    private userService: UsersService,
    private roomService: RoomsService,
  ) {}

  async createReservation(
    userId: number,
    dataBooking: CreateBookingDto,
  ): Promise<
    DataRespone & {
      data: reservations;
    }
  > {
    const room = await this.roomService.findUniqueRoomInDB(dataBooking.roomId);

    if (!room) throw new NotFoundException('Room not found.');

    const dataReservation = await this.createRevervationInDB(
      userId,
      dataBooking,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Booking successful!',
      data: dataReservation,
    };
  }

  async getAllRevervations(): Promise<DataRespone & { data: reservations[] }> {
    try {
      const reservations = await this.prisma.reservations.findMany({});

      return {
        statusCode: HttpStatus.OK,
        message: 'Success!',
        data: reservations,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getUniqueResvervation(
    reservationId: number,
  ): Promise<DataRespone & { data: reservations }> {
    const existingResers = await this.findUniqueReservation(reservationId);
    if (!existingResers) throw new NotFoundException('No booking found.');

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data: existingResers,
    };
  }

  async getAllByUserId(
    userId: number,
  ): Promise<DataRespone & { data: reservations[] }> {
    const user = await this.userService.findUniqueUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const dataReservations = await this.findManyReservationByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data: dataReservations,
    };
  }

  async putUpdateReservation(
    revervationId: number,
    newBookingData: CreateBookingDto,
  ): Promise<DataRespone & { data: reservations }> {
    const existingResers = await this.findUniqueReservation(revervationId);
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
    userId: number,
    reservationId: number,
  ): Promise<DataRespone> {
    const existingResers = await this.findUniqueReservation(reservationId);

    if (!existingResers)
      throw new NotFoundException('Reservation does not exist!');

    if (userId !== existingResers.user_id)
      throw new ForbiddenException(`You cannot delete someone else's booking!`);

    await this.deleteResersInDB(reservationId);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Delete success!',
    };
  }

  // =========== Database Methods ================
  async createRevervationInDB(
    userId: number,
    dataBooking: CreateBookingDto,
  ): Promise<reservations> {
    try {
      const dataReservation = await this.prisma.reservations.create({
        data: {
          user_id: userId,
          room_id: dataBooking.roomId,
          start_date: new Date(dataBooking.startDate),
          end_date: new Date(dataBooking.endDate),
          total_guests: dataBooking.totalGuests,
          price: dataBooking.price,
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
