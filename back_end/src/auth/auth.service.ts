import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpStatus,
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
import { PrismaSevice } from 'src/prisma/prisma.service';
import { Role } from 'src/users/enums/role.enum';
import { users } from '@prisma/client';
import { DataRespone } from 'src/types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaSevice,
  ) {}

  async signIn(userData: SignInDto): Promise<ResponeSignInPayLoad> {
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

    const tokens: TokensType = await this.getTokens(
      user.id,
      user.email,
      user.role,
    );

    await this.updateRefreshTokenHashed(user.id, tokens.refresh_token);

    return {
      statusCode: HttpStatus.OK,
      message: 'Logged in successfully!',
      data: {
        userData: { ...user, pass_word: '', hash_refresh_token: '' },
        tokens,
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

  async logOut(userId: number): Promise<DataRespone> {
    try {
      await this.prisma.users.updateMany({
        where: {
          id: userId,
          hash_refresh_token: {
            not: null,
          },
        },
        data: {
          hash_refresh_token: null,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Logout success!',
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async refreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<TokensType> {
    try {
      const user: users = await this.usersService.findUniqueUserById(userId);

      if (!user || !user.hash_refresh_token)
        throw new ForbiddenException('Access Denied!', {
          cause: 'User or refresh token does not exist!',
        });

      const checkRefreshToken = await bcrypt.compare(
        refreshToken,
        user.hash_refresh_token,
      );
      if (!checkRefreshToken)
        throw new ForbiddenException('Access Denied!', {
          cause: 'Refresh token does not exist!',
        });

      const tokens: TokensType = await this.getTokens(user.id, user.email, Role.User);
      await this.updateRefreshTokenHashed(user.id, tokens.refresh_token);

      return tokens;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  // =========== Database Methods ================
  async updateRefreshTokenHashed(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    try {
      const hashReTokens = await bcrypt.hash(refreshToken, 10);

      await this.prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          hash_refresh_token: hashReTokens,
        },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getTokens(
    userId: number,
    email: string,
    role: string,
  ): Promise<TokensType> {
    try {
      const payload: JwtPayload = {
        email: email,
        sub: userId,
        role,
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
