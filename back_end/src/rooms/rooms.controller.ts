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
import { GetCurrentUserId, Public } from 'src/common/decorators';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
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
import { room_images, rooms } from '@prisma/client';

@ApiTags('Rooms')
@ApiUnauthorizedResponse({
  description:
    'There is no access_token or the token does not exist or is no longer available.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal Server Error!',
})
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Public()
  @Get('get-all')
  @ApiOkResponse({
    description: 'Get all room successfully!',
  })
  @HttpCode(HttpStatus.OK)
  async getAllR(): Promise<DataRespone & { data: rooms[] }> {
    return await this.roomsService.getAll();
  }

  @Public()
  @Get('get-room-by-id/:id')
  @ApiOkResponse({
    description: 'Get room by id successfully!',
  })
  async getRoomById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DataRespone & { data: rooms }> {
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
  ): Promise<DataRespone & { data: rooms[] }> {
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
  ): Promise<DataRespone & { data: rooms[] }> {
    return await this.roomsService.getRoomsByAddress(keyword);
  }

  @Post('create')
  @ApiCreatedResponse({
    description: 'Created',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @GetCurrentUserId() userId: number,
    @Body() newRoomData: CreateRoomDto,
  ): Promise<DataRespone & { data: rooms }> {
    return await this.roomsService.createRoom(userId, newRoomData);
  }

  @Post('update/:roomId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update success!',
  })
  @ApiBearerAuth()
  async updateRoom(
    @GetCurrentUserId() userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() roomUpdateData: CreateRoomDto,
  ) {
    return await this.roomsService.updateRoom(userId, roomId, roomUpdateData);
  }

  @Delete('detele')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Delete successfully!',
  })
  @ApiBearerAuth()
  async deleteRoom(
    @GetCurrentUserId() userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<DataRespone> {
    return await this.roomsService.deleteRoom(userId, roomId);
  }

  @Put('upload-room-img/:roomId')
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
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadRoomImage(
    @GetCurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<DataRespone & { data: room_images }> {
    return await this.roomsService.uploadRoomImage(userId, file, roomId);
  }
}
