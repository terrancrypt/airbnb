import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ResponeSignInPayLoad, ResponeSignUpPayload } from './types';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DataRespone } from 'src/types';
import { Response } from 'express';
import { JwtAuthGuard } from './guards';

@ApiTags('Auth')
@ApiInternalServerErrorResponse({
  description: 'Internal server error!',
})
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('local/signin')
  @ApiOkResponse({
    description: 'Logged success!',
  })
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    description: 'User with email does not exist, or password is wrong.',
  })
  async signIn(
    @Body() userData: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponeSignInPayLoad> {
    return await this.authService.signIn(userData, res);
  }

  @Post('local/signup')
  @ApiCreatedResponse({
    description: 'Success!',
  })
  @ApiConflictResponse({
    description: 'User with an existing email, cannot register a new one.!',
  })
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() newUserData: SignUpDto): Promise<ResponeSignUpPayload> {
    return await this.authService.signUp(newUserData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Success!',
  })
  @HttpCode(HttpStatus.OK)
  async logOut(
    @Res({ passthrough: true }) res: Response,
  ): Promise<DataRespone> {
    return await this.authService.logOut(res);
  }
}
