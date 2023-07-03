import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  ResSignInPayLoad,
  ResSignUpPayload,
  TokensType,
} from './types';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaSevice } from 'src/prisma/prisma.service';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaSevice,
  ) {}

  async signIn(userData: SignInDto): Promise<ResSignInPayLoad> {
    const user = await this.usersService.findUniqueUserByEmail(userData.email);

    if (!user) {
      throw new UnauthorizedException("Account doesn't exits!");
    }

    const checkPass = await bcrypt.compare(userData.passWord, user.pass_word);

    if (checkPass === false) {
      throw new UnauthorizedException('Incorrect password!');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);

    this.updateRefreshTokenHashed(user.id, tokens.refresh_token);

    return {
      message: 'Logged in successfully!',
      data: {
        userData: { ...user, pass_word: '', hash_refresh_token: '' },
        tokens,
      },
    };
  }

  async signUp(newUserData: SignUpDto): Promise<ResSignUpPayload> {
    const user = await this.usersService.findUniqueUserByEmail(newUserData.email);

    if (!user) {
      const data = await this.usersService.createUserInDB(newUserData);

      return {
        message: 'Registered an account successfully!',
        data,
      };
    } else {
      throw new ConflictException('User already exists!');
    }
  }

  async logOut(userId: number): Promise<boolean> {
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
      return true;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async refreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<TokensType> {
    try {
      const user = await this.usersService.findUniqueUserById(userId);

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

      const tokens = await this.getTokens(user.id, user.email, Role.User);
      await this.updateRefreshTokenHashed(user.id, tokens.refresh_token);

      return tokens;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async updateRefreshTokenHashed(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hasshReTokens = await bcrypt.hash(refreshToken, 10);

    await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        hash_refresh_token: hasshReTokens,
      },
    });
  }

  async getTokens(userId: number, email: string, role: string): Promise<TokensType> {
    const payload: JwtPayload = {
      email: email,
      sub: userId,
      role
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
  }
}
