import {
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SignInDto } from '../dto/sign-in.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const body = plainToInstance(SignInDto, request.body);
    const errors = await validate(body);

    if (errors.length > 0) {
      throw new UnprocessableEntityException();
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
