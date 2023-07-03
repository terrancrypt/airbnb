import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  reservationId: number;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  roomId: number;

  @ApiProperty({
    example: 1,
    description: 'Only rated from 1 to 5',
  })
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: "this is my comment",
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
