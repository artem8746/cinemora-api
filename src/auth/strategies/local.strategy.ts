import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '@/users/users.service';
import { comparePasswords } from '@/utils/hash-passwords';
import { JwtSummaryDto } from '../dto/jwt-summary.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  public async validate(
    email: string,
    password: string,
  ): Promise<JwtSummaryDto> {
    const user = await this.userService.findByEmail(email);

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
