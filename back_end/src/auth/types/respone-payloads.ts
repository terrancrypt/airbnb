import { users } from '@prisma/client';
import { DataRespone } from 'src/types';

export type ResponeSignUpPayload = DataRespone & {
  data: users;
};

export type ResponeSignInPayLoad = DataRespone & {
  data: {
    userData: users ;
  };
};
