import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetCurrentUserId, Public } from 'src/common/decorators';
import { reservations } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { DataRespone } from 'src/types';

@ApiTags('Reservations')
@ApiUnauthorizedResponse({
  description:
    'There is no access_token or the token does not exist or is no longer available.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal Server Error!',
})
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('create')
  @ApiCreatedResponse({
    description: 'Created',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async createReservation(
    @GetCurrentUserId() userId: number,
    @Body() dataBooking: CreateBookingDto,
  ): Promise<
    DataRespone & {
      data: reservations;
    }
  > {
    return await this.reservationsService.createReservation(
      userId,
      dataBooking,
    );
  }

  @Get('get-all')
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async getAllRevervations(): Promise<DataRespone & { data: reservations[] }> {
    return await this.reservationsService.getAllRevervations();
  }

  @Get(':reservationId')
  @ApiOkResponse({
    description: "Success!"
  })
  @ApiNotFoundResponse({
    description: 'The reservation code does not exist or the code is wrong!',
  })
  @ApiBearerAuth()
  async getUniqueResvervation(
    @Param('reservationId', ParseIntPipe) reservationId: number
  ): Promise<DataRespone & {data: reservations}>{
    return await this.reservationsService.getUniqueResvervation(reservationId);
  }

  @Get('get-all-by-user/:userId')
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async getAllByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<DataRespone & { data: reservations[] }> {
    return await this.reservationsService.getAllByUserId(userId);
  }

  @Put(':reservationId')
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiNotFoundResponse({
    description: 'The reservation code does not exist or the code is wrong!',
  })
  @ApiBearerAuth()
  async putUpdateReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() newBookingData: CreateBookingDto,
  ): Promise<DataRespone & { data: reservations }> {
    return await this.reservationsService.putUpdateReservation(
      reservationId,
      newBookingData,
    );
  }

  @Delete(':reservationId')
  @ApiNoContentResponse({
    description: 'Delete success',
  })
  @ApiNotFoundResponse({
    description: 'The reservation code does not exist or the code is wrong!',
  })
  @ApiForbiddenResponse({
    description: "You delete someone else's reservation, only the one you created can be deleted!"
  })
  @ApiBearerAuth()
  async deleteReservation(
    @GetCurrentUserId() userId: number,
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ): Promise<DataRespone> {
    return await this.reservationsService.deleteReservation(userId,reservationId);
  }
}
