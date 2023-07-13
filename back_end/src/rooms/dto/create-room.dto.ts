import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    example: 'This is my room',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 2,
  })
  @IsNotEmpty()
  maxGuests: number;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  totalBedrooms: number;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  totalBeds: number;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  totalBathrooms: number;

  @ApiProperty({
    example: 'This is my room description',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 350000,
  })
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  hasTv: boolean;

  @ApiProperty({
    example: false,
  })
  @IsNotEmpty()
  hasKitchen: boolean;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  hasAirConditioner: boolean;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  hasWifi: boolean;

  @ApiProperty({
    example: false,
  })
  @IsNotEmpty()
  hasWasher: boolean;

  @ApiProperty({
    example: false,
  })
  @IsNotEmpty()
  hasIron: boolean;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  hasPool: boolean;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  hasParking: boolean;

  @ApiProperty({
    example: false,
  })
  @IsNotEmpty()
  petsAllowed: boolean;

  @ApiProperty({
    example: '123 Ngo Quyen',
  })
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    example: 'Quan 1',
  })
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    example: 'Ho Chi Minh City',
  })
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: 'Viet Nam',
  })
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    example: 2,
    description: 'room type 1: Apartment, type 2: Hotel, type 3: Home',
  })
  @IsNotEmpty()
  roomType: number;

  @ApiProperty({ example: 1 })
  placeId: number;
}
