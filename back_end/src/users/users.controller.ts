import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req) {
    return 'Hell no';
  }

  
  @Get('profile/:id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', required: true})
  getProfileById(@Param() id: string) {
    return id;
  }
}
