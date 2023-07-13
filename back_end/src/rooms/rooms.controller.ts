import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseIntPipe,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from 'src/common/decorators';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from './dto/upload-image.dto';
import { DataRespone } from 'src/types';
import { ResponeARoom, ResponeRooms, ResponeUploadRoomImg } from './types';
import { JwtPayload } from 'src/auth/types';

@ApiTags('Rooms')
@ApiUnauthorizedResponse({
  description: 'Token expired or no token',
})
@ApiInternalServerErrorResponse({
  description: 'Internal Server Error!',
})
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Public()
  @Get('get-all')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Get all room successfully!',
  })
  async getAllRooms(): Promise<ResponeRooms> {
    return await this.roomsService.getAllRooms();
  }

  @Public()
  @Get('get-room-by-id/:id')
  @ApiOkResponse({
    description: 'Get room by id successfully!',
  })
  async getRoomById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponeARoom> {
    return await this.roomsService.getRoomById(id);
  }

  @Public()
  @Get('get-rooms-paginated')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Get room paginated successfully!',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid value for page or pageSize. Page or PageSize must be a positive integer.',
  })
  @HttpCode(HttpStatus.OK)
  async getRoomsPaginated(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ): Promise<ResponeRooms> {
    return await this.roomsService.getRoomsPaginated(page, pageSize);
  }

  @Public()
  @Get('get-rooms-by-address')
  @ApiOkResponse({
    description: 'Get room by address successfully!',
  })
  @HttpCode(HttpStatus.OK)
  async getRoomsByAdress(
    @Query('keyword') keyword: string,
  ): Promise<ResponeRooms> {
    return await this.roomsService.getRoomsByAddress(keyword);
  }

  @Post('create')
  @ApiCreatedResponse({
    description: 'Created',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  async postCreateRoom(
    @GetCurrentUserId() userId: number,
    @Body() newRoomData: CreateRoomDto,
  ): Promise<ResponeARoom> {
    return await this.roomsService.postCreateRoom(userId, newRoomData);
  }

  @Put(':roomId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update success!',
  })
  @ApiCookieAuth()
  async updateRoom(
    @GetCurrentUserId() userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() roomUpdateData: CreateRoomDto,
  ): Promise<ResponeARoom> {
    return await this.roomsService.updateRoom(userId, roomId, roomUpdateData);
  }

  @Delete(':roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Delete successfully!',
  })
  @ApiForbiddenResponse({
    description:
      'Do not have permission, administrators or users themselves can delete their rooms',
  })
  @ApiCookieAuth()
  async deleteRoom(
    @GetCurrentUser() user: JwtPayload,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<DataRespone> {
    return await this.roomsService.deleteRoom(user, roomId);
  }

  @Post('upload-room-img/:roomId')
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Created',
  })
  @ApiBody({
    type: UploadImageDto,
  })
  @ApiNotFoundResponse({
    description: 'RoomId does not exist.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadRoomImage(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<ResponeUploadRoomImg> {
    return await this.roomsService.uploadRoomImage(userId, file, roomId);
  }
}
