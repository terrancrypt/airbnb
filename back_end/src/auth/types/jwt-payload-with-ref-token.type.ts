import { JwtPayload } from './jwt-payload.type';

export type JwtPayLoadWithReTokens = JwtPayload & { refreshToken: string };
