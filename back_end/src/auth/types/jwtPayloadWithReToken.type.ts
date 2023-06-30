import { JwtPayload } from './jwtPayload.type';

export type JwtPayLoadWithReTokens = JwtPayload & { refreshToken: string };
