import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
  ForbiddenException
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReservationsService } from 'src/reservations/reservations.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { reservations, reviews, rooms } from '@prisma/client';
import { DataRespone } from 'src/types';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ResponeAReview, ResponeReviews } from './types';
import { JwtPayload } from 'src/auth/types';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class ReviewsService {
  constructor(
    private reservationService: ReservationsService,
    private roomsService: RoomsService,
    private prisma: PrismaSevice,
  ) {}

  async createReview(
    userId: number,
    dataReview: CreateReviewDto,
  ): Promise<ResponeAReview> {
    const reservation: reservations =
      await this.reservationService.findUniqueReservation(
        dataReview.reservationId,
      );
    if (!reservation)
      throw new BadRequestException(
        'You must experience it before you can review this room!',
      );

    if (reservation.user_id !== userId)
      throw new BadRequestException(
        `You cannot reviews room with other people's reservations!`,
      );

    const room: rooms = await this.roomsService.findUniqueRoomInDB(
      dataReview.roomId,
    );
    if (!room) throw new NotFoundException('Room not found!');

    const data: reviews = await this.createReviewInDB(userId, dataReview);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success!',
      data,
    };
  }

  async getAllReview(): Promise<ResponeReviews> {
    try {
      const data: reviews[] = await this.prisma.reviews.findMany();

      return {
        statusCode: HttpStatus.OK,
        message: 'Success!',
        data,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getReviewsByRoom(roomId: number): Promise<ResponeReviews> {
    const room: rooms = await this.roomsService.findUniqueRoomInDB(roomId);
    if (!room) throw new NotFoundException('Room not found.');

    const data: reviews[] = await this.findReviewsByRoomInDB(roomId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data,
    };
  }

  async updateReview(
    userId: number,
    reviewId: number,
    updateReviewData: UpdateReviewDto,
  ): Promise<ResponeAReview> {
    const review: reviews = await this.findUniqueReviewInDB(reviewId);
    if (!review) throw new NotFoundException('Review not found.');

    if (review.user_create_id !== userId)
      throw new BadRequestException(`Cannot update other people's reviews`);

    const data: reviews = await this.updateReviewInDB(
      reviewId,
      updateReviewData,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data,
    };
  }

  async deleteReview(user: JwtPayload, reviewId: number): Promise<DataRespone> {
    const review: reviews = await this.findUniqueReviewInDB(reviewId);
    if (!review) throw new NotFoundException('Review not found.');

    if (user.role === Role.Admin || review.user_create_id === user.sub) {
      await this.deleteReviewInDB(reviewId);
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Delete success!',
      };
    } else {
      throw new ForbiddenException(
        'You do not have permission to delete this room.',
      );
    }
  }

  // =========== Database Methods ================
  async createReviewInDB(
    userId: number,
    dataReview: CreateReviewDto,
  ): Promise<reviews> {
    try {
      const data: reviews = await this.prisma.reviews.create({
        data: {
          reservation_id: dataReview.reservationId,
          room_id: dataReview.roomId,
          rating: dataReview.rating,
          comment: dataReview.comment,
          user_create_id: userId,
        },
      });

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findReviewsByRoomInDB(roomId: number): Promise<reviews[]> {
    try {
      const data: reviews[] = await this.prisma.reviews.findMany({
        where: {
          room_id: roomId,
        },
      });

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findUniqueReviewInDB(reviewId: number): Promise<reviews> {
    try {
      const data: reviews = await this.prisma.reviews.findUnique({
        where: {
          id: reviewId,
        },
      });

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async updateReviewInDB(
    reviewId: number,
    updateReviewData: UpdateReviewDto,
  ): Promise<reviews> {
    try {
      const data: reviews = await this.prisma.reviews.update({
        where: {
          id: reviewId,
        },
        data: {
          rating: updateReviewData.rating,
          comment: updateReviewData.comment,
        },
      });

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async deleteReviewInDB(reviewId: number): Promise<void> {
    try {
      await this.prisma.reviews.delete({
        where: {
          id: reviewId,
        },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
