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
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DataRespone } from 'src/types';
import { places } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from 'src/rooms/dto/upload-image.dto';

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
      'There is no access_token or the token does not exist or is no longer available.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async createPlace(
    @Body() dataNewPlace: CreatePlaceDto,
  ): Promise<DataRespone & { data: places }> {
    return await this.placesService.createPlace(dataNewPlace);
  }

  @Get('get-all')
  @ApiOkResponse({
    description: 'Success',
  })
  @HttpCode(HttpStatus.OK)
  async getAll() {
    return this.placesService.getAll();
  }

  @Get('get-a-place/:placeId')
  @ApiOkResponse({
    description: 'Success',
  })
  @HttpCode(HttpStatus.OK)
  async getOnePlace(
    @Param('placeId', ParseIntPipe) placeId: number,
  ): Promise<DataRespone & { data: places }> {
    return await this.placesService.getOnePlace(placeId);
  }

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
  ): Promise<DataRespone & { data: places[] }> {
    return await this.placesService.getPlacesPaginated(page, pageSize);
  }

  @Put('update/:placeId')
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    description:
      'There is no access_token or the token does not exist or is no longer available.',
  })
  @ApiNotFoundResponse({
    description: 'Place not found.',
  })
  @ApiBearerAuth()
  async putUpdatePlace(
    @Param('placeId', ParseIntPipe) placeId: number,
    @Body() dataPlaceUpdate: CreatePlaceDto,
  ): Promise<DataRespone & { data: places }> {
    return await this.placesService.putUpdatePlace(placeId, dataPlaceUpdate);
  }

  @Delete('delete/:placeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Success!',
  })
  @ApiUnauthorizedResponse({
    description:
      'There is no access_token or the token does not exist or is no longer available.',
  })
  @ApiNotFoundResponse({
    description: 'Place not found.',
  })
  @ApiBearerAuth()
  async deletePlace(
    @Param('placeId', ParseIntPipe) placeId: number,
  ): Promise<DataRespone> {
    return await this.placesService.deletePlace(placeId);
  }

  @Post('upload-place-img/:placeId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadImageDto,
  })
  @ApiOkResponse({
    description: 'Created',
  })
  @ApiUnauthorizedResponse({
    description:
      'There is no access_token or the token does not exist or is no longer available.',
  })
  @ApiNotFoundResponse({
    description: 'Place not found.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlaceImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('placeId', ParseIntPipe) placeId: number,
  ): Promise<DataRespone & { data: places }> {
    return await this.placesService.uploadPlaceImage(placeId, file);
  }
}
