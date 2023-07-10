import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetCurrentUser, GetCurrentUserId, Public, Roles } from 'src/common/decorators';
import { Role } from './enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { DataRespone } from 'src/types';
import { JwtPayload } from 'src/auth/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponeAUser, ResponeUsers } from './types';

@ApiTags('User')
@ApiInternalServerErrorResponse({
  description: 'Internal server error!',
})
@ApiUnauthorizedResponse({
  description: 'Token expired or no token',
})
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Success',
  })
  @ApiConflictResponse({ description: 'Email already registered.' })
  @ApiForbiddenResponse({
    description: 'Only admin users have permission',
  })
  @ApiCookieAuth()
  async postCreateUser(@Body() userData: CreateUserDto): Promise<ResponeAUser> {
    return await this.usersService.postCreateUser(userData);
  }

  @Get('get-all')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success!',
  })
  @ApiForbiddenResponse({
    description: 'Account does not have permissions',
  })
  @ApiForbiddenResponse({
    description: 'Only admin users have permission',
  })
  @ApiCookieAuth()
  async getAllUser(): Promise<ResponeUsers> {
    return await this.usersService.getAllUser();
  }

  @Get('get-user-paginated')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Invalid value for page or pageSize',
  })
  @ApiForbiddenResponse({
    description: 'Only admin users have permission',
  })
  @ApiCookieAuth()
  async getUserPaginated(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.usersService.getUserPaginated(page, pageSize);
  }

  @Public()
  @Get('profile/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Success!"
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  async getUserProfile(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usersService.getUserProfile(userId);
  }

  @Public()
  @Get('search/:fullName')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success!',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async getUserByName(
    @Param('fullName') fullName: string,
  ): Promise<ResponeUsers> {
    return await this.usersService.getUserByName(fullName);
  }

  @Put('update/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success!',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiConflictResponse({
    description: 'Email already exist!',
  })
  @ApiForbiddenResponse({
    description:
      'Do not have permission, administrators or users themselves can update their information',
  })
  @ApiCookieAuth()
  async putUpdateUser(
    @GetCurrentUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dataUpdate: CreateUserDto,
  ): Promise<ResponeAUser> {
    return await this.usersService.putUpdateUser(user, userId, dataUpdate);
  }

  @Delete('delete/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOkResponse({
    description: 'Ok',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiCookieAuth()
  async deleteUser(
    @GetCurrentUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<DataRespone> {
    return await this.usersService.deleteUser(user, userId);
  }

  @Post('upload-user-avatar')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Success!',
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiCookieAuth()
  async postUploadUserAvatar(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponeAUser> {
    return await this.usersService.postUploadUserAvatar(userId, file);
  }
}
