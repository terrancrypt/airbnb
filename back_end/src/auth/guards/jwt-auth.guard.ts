import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Response } from 'express';
import { AuthService } from '../auth.service';
import { SessionService } from '../session/session.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private config: ConfigService,
    private authService: AuthService,
    private sessionService: SessionService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse() as Response;
    const { accessToken, refreshToken } = request.cookies;

    const { payload, expired } = await this.verifyJWT(
      accessToken,
      'verifyAToken',
    );

    if (payload) {
      return (await super.canActivate(context)) as boolean;
    }

    const { payload: decoded } =
      expired && refreshToken
        ? await this.verifyJWT(refreshToken, 'verifyRToken')
        : { payload: null };

    if (!decoded) {
      return (await super.canActivate(context)) as boolean;
    }

    const sessionId = await this.sessionService.getSession(decoded.sessionId);

    if (!sessionId) {
      return false;
    }

    await this.sessionService.upTimeSession(sessionId);

    const { access_token, refresh_token } = await this.authService.getTokens(
      decoded.sub,
      decoded.email,
      decoded.role,
      sessionId,
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

    return (await super.canActivate(context)) as boolean;
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
