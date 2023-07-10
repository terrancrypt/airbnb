import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJwt]),
      secretOrKey: config.get<string>('SECRET_ACCESS_TOKEN_KEY'),
    });
  }

  private static extractJwt(req: Request): string | null {
    if (req.cookies && req.cookies['accessToken']) {
      return req.cookies['accessToken'];
    }

    return null;
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
