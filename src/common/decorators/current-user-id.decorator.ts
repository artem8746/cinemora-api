import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { AuthenthicatedRequest } from '@/generic/interface/request';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenthicatedRequest>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new NotFoundException('User not found');
    }

    return userId;
  },
);
