import {
  Injectable,
  InternalServerErrorException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { DataRespone } from 'src/types';
import { places } from '@prisma/client';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { ResponeAPlace, ResponePlaces } from './types';

@Injectable()
export class PlacesService {
  constructor(
    private prisma: PrismaSevice,
    private firebase: FirebaseService,
  ) {}

  async createPlace(dataNewPlace: CreatePlaceDto): Promise<ResponeAPlace> {
    try {
      const data = await this.prisma.places.create({
        data: {
          place_name: dataNewPlace.placeName,
          place_province: dataNewPlace.placeProvince,
          place_country: dataNewPlace.placeCountry,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Create success!',
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getAll(): Promise<ResponePlaces> {
    try {
      const data = await this.prisma.places.findMany();

      return {
        statusCode: HttpStatus.OK,
        message: 'Success!',
        data,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getOnePlace(placeId: number): Promise<ResponeAPlace> {
    const data = await this.findOnePlaceInDB(placeId);

    if (!data) throw new NotFoundException('Not place found.');

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data,
    };
  }

  async getPlacesPaginated(
    page: number,
    pageSize: number,
  ): Promise<ResponePlaces> {
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

    const data = await this.findPlacePagniatedInDB(page, pageSize);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data: data,
    };
  }

  async putUpdatePlace(
    placeId: number,
    dataPlaceUpdate: CreatePlaceDto,
  ): Promise<ResponeAPlace> {
    const place = await this.findOnePlaceInDB(placeId);
    if (!place) throw new NotFoundException('Place does not exist.');

    const data = await this.updatePlaceInDB(placeId, dataPlaceUpdate);

    return {
      statusCode: HttpStatus.OK,
      message: 'Update success!',
      data,
    };
  }

  async deletePlace(placeId: number): Promise<DataRespone> {
    const place = await this.findOnePlaceInDB(placeId);
    if (!place) throw new NotFoundException('Place does not exist.');

    await this.deletePlaceInBD(placeId);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Delete success!',
    };
  }

  async uploadPlaceImage(
    placeId: number,
    file: Express.Multer.File,
  ): Promise<ResponeAPlace> {
    const place = await this.findOnePlaceInDB(placeId);
    if (!place) throw new NotFoundException('Place does not exist.');

    const urlImage: string = await this.firebase.FirebaseUpload(file);
    const data = await this.updateImgPlaceInDB(placeId, urlImage);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success!',
      data,
    };
  }

  // =========== Database Methods ================
  async findOnePlaceInDB(placeId: number): Promise<places> {
    try {
      const data = await this.prisma.places.findUnique({
        where: {
          id: placeId,
        },
      });

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findPlacePagniatedInDB(
    page: number,
    pageSize: number,
  ): Promise<places[]> {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      const data = await this.prisma.places.findMany({
        skip,
        take,
      });

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async updatePlaceInDB(
    placeId: number,
    dataPlaceUpdate: CreatePlaceDto,
  ): Promise<places> {
    try {
      const data = await this.prisma.places.update({
        where: {
          id: placeId,
        },
        data: {
          place_name: dataPlaceUpdate.placeName,
          place_province: dataPlaceUpdate.placeProvince,
          place_country: dataPlaceUpdate.placeCountry,
        },
      });

      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async deletePlaceInBD(placeId: number): Promise<void> {
    try {
      await this.prisma.places.delete({
        where: {
          id: placeId,
        },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async updateImgPlaceInDB(
    placeId: number,
    urlPlaceImg: string,
  ): Promise<places> {
    try {
      const data = await this.prisma.places.update({
        where: {
          id: placeId,
        },
        data: {
          place_img: urlPlaceImg,
        },
      });
      return data;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
