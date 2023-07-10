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
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetCurrentUserId, Public, Roles } from 'src/common/decorators';
import { CreateBookingDto } from './dto/create-booking.dto';
import { DataRespone } from 'src/types';
import { ResponeAReser, ResponeResers } from './types';
import { Role } from 'src/users/enums/role.enum';
import { JwtPayload } from 'src/auth/types';

@ApiTags('Reservations')
@ApiUnauthorizedResponse({
  description:
    'Token expired or no token',
})
@ApiInternalServerErrorResponse({
  description: 'Internal Server Error!',
})
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Success!',
  })
  @ApiCookieAuth()
  async postCreateReservation(
    @GetCurrentUserId() userId: number,
    @Body() dataBooking: CreateBookingDto,
  ): Promise<ResponeAReser> {
    return await this.reservationsService.postCreateReservation(
      userId,
      dataBooking,
    );
  }

  @Get('get-all')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  async getAllRevervations(): Promise<ResponeResers> {
    return await this.reservationsService.getAllRevervations();
  }

  @Public()
  @Get('/get-unique/:reservationId')
  @ApiOkResponse({
    description: 'Success!',
  })
  @ApiNotFoundResponse({
    description: 'The reservation code does not exist or the code is wrong!',
  })
  @ApiCookieAuth()
  async getUniqueResvervation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ): Promise<ResponeAReser> {
    return await this.reservationsService.getUniqueResvervation(reservationId);
  }

  @Public()
  @Get('get-all-by-user/:userId')
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  async getAllByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ResponeResers> {
    return await this.reservationsService.getAllByUserId(userId);
  }

  @Put(':reservationId')
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiNotFoundResponse({
    description: 'The reservation code does not exist or the code is wrong!',
  })
  @ApiCookieAuth()
  async putUpdateReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() newBookingData: CreateBookingDto,
  ): Promise<ResponeAReser> {
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
    description:
      'Do not have permission, administrators or users themselves can delete their resetvations',
  })
  @ApiCookieAuth()
  async deleteReservation(
    @GetCurrentUserId() user: JwtPayload,
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ): Promise<DataRespone> {
    return await this.reservationsService.deleteReservation(
      user,
      reservationId,
    );
  }
}
