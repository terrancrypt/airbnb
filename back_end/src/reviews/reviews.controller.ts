import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { DataRespone } from 'src/types';
import { reviews } from '@prisma/client';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Role } from 'src/users/enums/role.enum';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('create')
  @ApiBearerAuth()
  async createReview(
    @GetCurrentUserId() userId: number,
    @Body() dataReview: CreateReviewDto,
  ): Promise<
    DataRespone & {
      data: reviews;
    }
  > {
    return await this.reviewsService.createReview(userId, dataReview);
  }

  @Get('get-all')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getAllReview(): Promise<DataRespone & { data: reviews[] }> {
    return await this.reviewsService.getAllReview();
  }

  @Get('get-reviews-by-room/:roomId')
  @HttpCode(HttpStatus.OK)
  async getReviewsByRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<DataRespone & { data: reviews[] }> {
    return await this.reviewsService.getReviewsByRoom(roomId);
  }

  @Put('update/:reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async updateReview(
    @GetCurrentUserId() userId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() updateReviewData: UpdateReviewDto,
  ): Promise<DataRespone & { data: reviews }> {
    return await this.reviewsService.updateReview(
      userId,
      reviewId,
      updateReviewData,
    );
  }

  @Delete('delete/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async deleteReview(
    @GetCurrentUserId() userId: number,
    @Param('reviewId') reviewId: number,
  ): Promise<DataRespone> {
    return await this.reviewsService.deleteReview(userId, reviewId);
  }
}
