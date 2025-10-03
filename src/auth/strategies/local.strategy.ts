import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { comparePasswords } from '@/utils/hash-passwords';
import { JwtSummaryDto } from '../dto/jwt-summary.dto';
import { CommandBus } from '@nestjs/cqrs';
import { GetUserByEmailCommand } from '@/users/commands/get-user-by-email/get-user-by-email.command';
import { User } from '@/users/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly commandBus: CommandBus) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  public async validate(
    email: string,
    password: string,
  ): Promise<JwtSummaryDto> {
    const user = await this.commandBus.execute<GetUserByEmailCommand, User>(
      new GetUserByEmailCommand(email),
    );

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

    const isValidPassword = await comparePasswords(password, user.password);

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
