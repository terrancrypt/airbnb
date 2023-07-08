import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayLoadWithReTokens  } from '../../auth/types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayLoadWithReTokens | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    console.log("request user: ",request.user);
    if (!data) return request.user;
    return request.user[data];
  },
);

