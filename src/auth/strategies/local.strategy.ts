import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { comparePasswords } from '@/utils/hash-passwords';
import { JwtSummaryDto } from '../dto/jwt-summary.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from '@/users/queries/get-user-by-email/get-user-by-email.query';
import { GetUserByEmailQueryResponse } from '@/users/queries/get-user-by-email/get-user-by-email.handler';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  public async validate(
    email: string,
    password: string,
  ): Promise<JwtSummaryDto> {
    const user = await this.queryBus.execute<
      GetUserByEmailQuery,
      GetUserByEmailQueryResponse
    >(new GetUserByEmailQuery(email));

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
      });
    }

    if (user.password === null) {
      throw new BadRequestException({
        message: 'Unregistered user',
      });
    }

    const isValidPassword = await comparePasswords(
      password,
      user?.password ?? '',
    );

    if (!isValidPassword) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
      });
    }

    return new JwtSummaryDto({
      ...user,
    });
  }
}
