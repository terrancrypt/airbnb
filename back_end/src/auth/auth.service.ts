import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  ResponeSignInPayLoad,
  ResponeSignUpPayload,
  TokensType,
} from './types';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ConfigService } from '@nestjs/config';
import { users } from '@prisma/client';
import { DataRespone } from 'src/types';
import { Response } from 'express';
import { SessionService } from './session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private sessionService: SessionService,
  ) {}

  async signIn(
    userData: SignInDto,
    res: Response,
  ): Promise<ResponeSignInPayLoad> {
    const user: users = await this.usersService.findUniqueUserByEmail(
      userData.email,
    );
    if (!user) {
      throw new UnauthorizedException("Account doesn't exits!");
    }

    const checkPass: boolean = await bcrypt.compare(
      userData.passWord,
      user.pass_word,
    );

    if (checkPass === false) {
      throw new UnauthorizedException('Incorrect password!');
    }

    const session = await this.sessionService.createSession(user.email);

    const { access_token, refresh_token }: TokensType = await this.getTokens(
      user.id,
      user.email,
      user.role,
      session.id,
    );

    res.cookie('accessToken', access_token, {
      maxAge: 900000, //15mins
      httpOnly: true,
    });

    res.cookie('refreshToken', refresh_token, {
      maxAge: 864000000, //10days
      httpOnly: true,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Logged in successfully!',
      data: {
        userData: { ...user, pass_word: null },
      },
    };
  }

  async signUp(newUserData: SignUpDto): Promise<ResponeSignUpPayload> {
    const user: users = await this.usersService.findUniqueUserByEmail(
      newUserData.email,
    );

    if (user) throw new ConflictException('User already exists!');

    const data: users = await this.usersService.createUserInDB(newUserData);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Registered an account successfully!',
      data,
    };
  }

  async logOut(res: Response, user: JwtPayload): Promise<DataRespone> {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      this.sessionService.deleleSession(user.sessionId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Logout success!',
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  // =========== JWT Methods ================
  async getTokens(
    userId: number,
    email: string,
    role: string,
    sessionId: number,
  ): Promise<TokensType> {
    try {
      const payload: JwtPayload = {
        email: email,
        sub: userId,
        role,
        sessionId,
      };

      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.config.get<string>('SECRET_ACCESS_TOKEN_KEY'),
          expiresIn: '15m',
        }),
        this.jwtService.signAsync(payload, {
          secret: this.config.get<string>('SECRET_REFRESH_TOKEN_KEY'),
          expiresIn: '1w',
        }),
      ]);

      return {
        access_token,
        refresh_token,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
