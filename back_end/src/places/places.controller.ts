import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
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
import { DataRespone } from 'src/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from 'src/rooms/dto/upload-image.dto';
import { ResponeAPlace, ResponePlaces } from './types';
import { Public } from 'src/common/decorators';

@ApiTags('Places')
@ApiInternalServerErrorResponse({
  description: 'Internal Server Error!',
})
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post('create')
  @ApiCreatedResponse({
    description: 'Create success!',
  })
  @ApiUnauthorizedResponse({
    description:
      'Token expired or no token',
  })
  @ApiForbiddenResponse({
    description: 'Only admin users have permission',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  async createPlace(
    @Body() dataNewPlace: CreatePlaceDto,
  ): Promise<ResponeAPlace> {
    return await this.placesService.createPlace(dataNewPlace);
  }

  @Public()
  @Get('get-all')
  @ApiOkResponse({
    description: 'Success',
  })
  @HttpCode(HttpStatus.OK)
  async getAll(): Promise<ResponePlaces> {
    return this.placesService.getAll();
  }

  @Public()
  @Get('get-a-place/:placeId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
  })
  async getOnePlace(
    @Param('placeId', ParseIntPipe) placeId: number,
  ): Promise<ResponeAPlace> {
    return await this.placesService.getOnePlace(placeId);
  }

  @Public()
  @Get('/get-places-paginated')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid value for page or pageSize. Page or PageSize must be a positive integer.',
  })
  async getPlacesPaginated(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ): Promise<ResponePlaces> {
    return await this.placesService.getPlacesPaginated(page, pageSize);
  }

  @Put('update/:placeId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    description:
      'Token expired or no token',
  })
  @ApiNotFoundResponse({
    description: 'Place not found.',
  })
  @ApiCookieAuth()
  async putUpdatePlace(
    @Param('placeId', ParseIntPipe) placeId: number,
    @Body() dataPlaceUpdate: CreatePlaceDto,
  ): Promise<ResponeAPlace> {
    return await this.placesService.putUpdatePlace(placeId, dataPlaceUpdate);
  }

  @Delete('delete/:placeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Success!',
  })
  @ApiUnauthorizedResponse({
    description:
      'Token expired or no token',
  })
  @ApiNotFoundResponse({
    description: 'Place not found.',
  })
  @ApiCookieAuth()
  async deletePlace(
    @Param('placeId', ParseIntPipe) placeId: number,
  ): Promise<DataRespone> {
    return await this.placesService.deletePlace(placeId);
  }

  @Post('upload-place-img/:placeId')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadImageDto,
  })
  @ApiOkResponse({
    description: 'Created',
  })
  @ApiUnauthorizedResponse({
    description:
      'Token expired or no token',
  })
  @ApiNotFoundResponse({
    description: 'Place not found.',
  })
  @ApiCookieAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlaceImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('placeId', ParseIntPipe) placeId: number,
  ): Promise<ResponeAPlace> {
    return await this.placesService.uploadPlaceImage(placeId, file);
  }
}
