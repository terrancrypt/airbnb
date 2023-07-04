import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto} from './dto/sign-in.dto';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { ResponeSignInPayLoad, ResponeSignUpPayload, TokensType } from './types';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { RefeshTokenGuard } from './guards/refresh-token.guard';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { DataRespone } from 'src/types';

@ApiTags('Auth')
@ApiInternalServerErrorResponse({
  description: 'Internal server error!',
})
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('local/signin')
  @ApiOkResponse({
    description: "Logged success!"
  })
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    description: "User with email does not exist, or password is wrong."
  })
  async signIn(@Body() userData: SignInDto): Promise<ResponeSignInPayLoad> {
    return await this.authService.signIn(userData);
  }

  @Public()
  @Post('local/signup')
  @ApiCreatedResponse({
    description: 'Success!'
  })
  @ApiConflictResponse({
    description: "User with an existing email, cannot register a new one.!"
  })
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() newUserData: SignUpDto): Promise<ResponeSignUpPayload> {
    return await this.authService.signUp(newUserData);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "Success!"
  })
  @HttpCode(HttpStatus.OK)
  async logOut(@GetCurrentUserId() userId: number): Promise<DataRespone> {
    return await this.authService.logOut(userId);
  }

  @Public()
  @Post('refresh-token')
  @ApiBearerAuth()
  @UseGuards(RefeshTokenGuard)
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string 
  ) : Promise <TokensType> {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
