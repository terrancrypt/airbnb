import { ApiProperty } from '@nestjs/swagger';
import { IsDataURI, IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  roomId: number;

  @ApiProperty({
    example: "2023-07-02 12:00:00"
  })
  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  @ApiProperty({
    example: "2023-07-04 12:00:00"
  })
  endDate: string;

  @ApiProperty({
    example: 2
  })
  @IsNumber()
  @IsNotEmpty()
  totalGuests: number;

  @ApiProperty({
    example: 350000
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
