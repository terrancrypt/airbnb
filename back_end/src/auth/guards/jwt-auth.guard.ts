import { Injectable, ExecutionContext, Inject,forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload, } from '../types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private authService: AuthService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse() as Response;
    const { accessToken, refreshToken } = request.cookies;

    const { payload, expired } = await this.verifyJWT(
      accessToken,
      'verifyAToken',
    );

    if (payload) {
      return true;
    }

    const { payload: decoded } =
      expired && refreshToken
        ? await this.verifyJWT(refreshToken, 'verifyRToken')
        : { payload: null };

    if (!decoded) {
      return true;
    }

    const { access_token, refresh_token } = await this.authService.getTokens(
      decoded.sub,
      decoded.email,
      decoded.role,
    );

    response.cookie('accessToken', access_token, {
      maxAge: 900000, //15mins
      httpOnly: true,
    });

    response.cookie('refreshToken', refresh_token, {
      maxAge: 864000000, //10days
      httpOnly: true,
    });

    request.cookies['accessToken'] = access_token;

    return true;
  }


  private async verifyJWT(
    token: string,
    tokenType: 'verifyAToken' | 'verifyRToken',
  ): Promise<{ payload: JwtPayload | null; expired: boolean }> {
    try {
      let decoded: JwtPayload;
      if (tokenType === 'verifyAToken') {
        decoded = await this.jwtService.verifyAsync(token, {
          secret: this.config.get<string>('SECRET_ACCESS_TOKEN_KEY'),
        });
      } else {
        decoded = await this.jwtService.verifyAsync(token, {
          secret: this.config.get<string>('SECRET_REFRESH_TOKEN_KEY'),
        });
      }

      return { payload: decoded, expired: false };
    } catch (error) {
      return { payload: null, expired: true };
    }
  }
}
