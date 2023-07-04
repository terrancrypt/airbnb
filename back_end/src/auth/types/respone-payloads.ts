import { users } from '@prisma/client';
import { TokensType } from './tokens.type';
import { DataRespone } from 'src/types';

export type ResponeSignUpPayload = DataRespone & {
  data: users;
};

export type ResponeSignInPayLoad = DataRespone & {
  data: {
    userData: users;
    tokens: TokensType;
  };
};
