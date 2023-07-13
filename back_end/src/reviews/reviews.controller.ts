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
import {
  ApiBadRequestResponse,
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
import { CreateReviewDto } from './dto/create-review.dto';
import { GetCurrentUser, GetCurrentUserId, Public, Roles } from 'src/common/decorators';
import { DataRespone } from 'src/types';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Role } from 'src/users/enums/role.enum';
import { ResponeAReview, ResponeReviews } from './types';
import { JwtPayload } from 'src/auth/types';

@ApiTags('Reviews')
@ApiInternalServerErrorResponse({
  description: 'Internal server error!',
})
@ApiUnauthorizedResponse({
  description: 'Token expired or no token',
})
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Success!',
  })
  @ApiBadRequestResponse({
    description: 'Only users who have experienced the room can rate',
  })
  @ApiNotFoundResponse({
    description: 'Room not found',
  })
  @ApiCookieAuth()
  async postCreateReview(
    @GetCurrentUserId() userId: number,
    @Body() dataReview: CreateReviewDto,
  ): Promise<ResponeAReview> {
    return await this.reviewsService.postCreateReview(userId, dataReview);
  }

  @Get('get-all')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success!',
  })
  @ApiForbiddenResponse({
    description: 'Only admin users have permission',
  })
  @ApiCookieAuth()
  async getAllReview(): Promise<ResponeReviews> {
    return await this.reviewsService.getAllReview();
  }

  @Public()
  @Get('get-reviews-by-room/:roomId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success!',
  })
  async getReviewsByRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<ResponeReviews> {
    return await this.reviewsService.getReviewsByRoom(roomId);
  }

  @Put('update/:reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({
    description: 'Success!',
  })
  @ApiNotFoundResponse({
    description: 'Review not found',
  })
  @ApiBadRequestResponse({
    description: "Cannot update other people's reviews",
  })
  async PutUpdateReview(
    @GetCurrentUserId() userId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() updateReviewData: UpdateReviewDto,
  ): Promise<ResponeAReview> {
    return await this.reviewsService.PutUpdateReview(
      userId,
      reviewId,
      updateReviewData,
    );
  }

  @Delete('delete/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiNoContentResponse({
    description: 'Success',
  })
  @ApiNotFoundResponse({
    description: 'Review not found',
  })
  @ApiForbiddenResponse({
    description:
      'Do not have permission, administrators or users themselves can update their reviews',
  })
  async deleteReview(
    @GetCurrentUser() user: JwtPayload,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ): Promise<DataRespone> {
    return await this.reviewsService.deleteReview(user, reviewId);
  }
}
