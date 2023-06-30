import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { GetCurrentUserId } from 'src/common/decorators';
import { ApiBearerAuth, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { resRoomCreated } from './types/resRoomCreated.type';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags("rooms")
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

 
  @Post('create')
  @ApiUnauthorizedResponse({
    description: "There is no access_token or the token does not exist or is no longer available."
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @GetCurrentUserId() userId: number,
    @Body() newRoomData: CreateRoomDto,
  ): Promise<resRoomCreated> {
    return this.roomsService.createRoom(userId, newRoomData);
  }

  @Post('upload-room-img')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadRoomImage(@GetCurrentUserId() userId: number, @UploadedFile() file: Express.Multer.File, @Query('roomId') roomId: number){
    return this.roomsService.uploadRoomImage(userId, file, roomId)
  }
}
