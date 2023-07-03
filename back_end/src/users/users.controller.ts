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
  UploadedFile
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
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
import { users } from '@prisma/client';
import { JwtPayload } from 'src/auth/types';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Success',
  })
  @ApiConflictResponse({ description: 'Email already registered.' })
  @ApiBearerAuth()
  async postCreateUser(
    @Body() userData: CreateUserDto,
  ): Promise<DataRespone & { data: users }> {
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
  @ApiBearerAuth()
  async getAllUser(): Promise<DataRespone & { data: users[] }> {
    return await this.usersService.getAllUser();
  }

  @Get('get-user-paginated')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Invalid value for page or pageSize',
  })
  @Roles(Role.Admin)
  @ApiBearerAuth()
  async getUserPaginated(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.usersService.getUserPaginated(page, pageSize);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @Get('profile/:userId')
  async getUserProfile(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usersService.getUserProfile(userId);
  }

  @Public()
  @Get('search/:fullName')
  async getUserByName(
    @Param('fullName') fullName: string,
  ): Promise<DataRespone & { data: users[] }> {
    return await this.usersService.getUserByName(fullName);
  }

  @Put('update/:userId')
  @ApiBearerAuth()
  async putUpdateUser(
    @GetCurrentUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dataUpdate: CreateUserDto,
  ): Promise<DataRespone & { data: users }> {
    return await this.usersService.putUpdateUser(user, userId, dataUpdate);
  }

  @Delete('delete/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async deleteUser(
    @GetCurrentUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<DataRespone> {
    return await this.usersService.deleteUser(user, userId);
  }

  @Post('upload-user-avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  async postUploadUserAvatar(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.postUploadUserAvatar(userId, file)
  }
}
