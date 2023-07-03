import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Only rated from 1 to 5',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: "this is my update comment"
  })
  comment: string;
}
