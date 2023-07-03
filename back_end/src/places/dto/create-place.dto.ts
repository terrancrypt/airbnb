import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({
    example: 'Phường Thăng Long',
  })
  @IsNotEmpty()
  placeName: string;

  @ApiProperty({
    example: 'Hà Nội',
  })
  @IsNotEmpty()
  placeProvince: string;

  @ApiProperty({
    example: 'Việt Nam',
  })
  @IsNotEmpty()
  placeCountry: string;
}
