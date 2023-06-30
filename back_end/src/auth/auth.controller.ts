import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto} from './dto/sign-in.dto';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { ResSignInPayLoad, ResSignUpPayload, TokensType } from './types';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { RefeshTokenGuard } from './guards/refresh-token.guard';
import { ApiConflictResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiUnauthorizedResponse({
    description: "User with email does not exist, or password is wrong."
  })
  @Post('local/signin')
  signIn(@Body() userData: SignInDto): Promise<ResSignInPayLoad> {
    const { email, passWord } = userData;
    return this.authService.signIn({
      email,
      passWord: passWord,
    });
  }

  @Public()
  @Post('local/signup')
  @ApiConflictResponse({
    description: "User with an existing email, cannot register a new one.!"
  })
  @HttpCode(HttpStatus.CREATED)
  @HttpCode(HttpStatus.OK)
  signUp(@Body() newUserData: SignUpDto): Promise<ResSignUpPayload> {
    return this.authService.signUp(newUserData);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logOut(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logOut(userId);
  }

  @Public()
  @Post('refresh-token')
  @UseGuards(RefeshTokenGuard)
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string 
  ) : Promise <TokensType> {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
