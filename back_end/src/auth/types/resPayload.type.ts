import { users } from '@prisma/client';
import { TokensType } from './tokens.type';

export type ResSignUpPayload = {
  message: string;
  data: users;
};

export type ResSignInPayLoad = {
  message: string;
  data: {
    userData: users;
    tokens: TokensType;
  };
};
