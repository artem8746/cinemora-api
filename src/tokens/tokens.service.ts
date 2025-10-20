import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { Repository } from 'typeorm';
import { CreateToken } from '../auth/dto/create-token.dto';
import { JwtSummaryDto } from '../auth/dto/jwt-summary.dto';

@Injectable()
export class TokensService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService,
  ) {}

  async updateRefreshToken(userId: string, refreshToken: string) {
    const token = await this.findToken(userId);

    if (!token) {
      return await this.registerToken({ token: refreshToken, userId });
    }

    token.refreshToken = refreshToken;

    return this.tokenRepository.save(token);
  }

  async findToken(userId: string) {
    const token = await this.tokenRepository.findOne({
      where: {
        id: userId,
      },
    });

    return token ?? null;
  }

  async registerToken(payload: CreateToken): Promise<Token> {
    const token = this.tokenRepository.create({
      user: { id: payload.userId },
      refreshToken: payload.token,
    });

    return await this.tokenRepository.save(token);
  }

  async deleteToken(userId: string) {
    const token = await this.findToken(userId);

    if (token) {
      return this.tokenRepository.delete({ id: userId });
    }
  }

  createToken(
    payload: JwtSummaryDto,
    options: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload },
      {
        ...options,
      },
    );
  }

  createAccessToken(payload: JwtSummaryDto): Promise<string> {
    return this.createToken(payload, {
      secret: this.configService.getOrThrow('auth.jwtSecretAccess'),
      expiresIn: this.configService.getOrThrow('auth.expiresAccessToken'),
    });
  }

  createRefreshToken(payload: JwtSummaryDto): Promise<string> {
    return this.createToken(payload, {
      secret: this.configService.getOrThrow('auth.jwtSecretRefresh'),
      expiresIn: this.configService.getOrThrow('auth.expiresRefreshToken'),
    });
  }

  createResetPasswordToken(payload: JwtSummaryDto): Promise<string> {
    return this.createToken(payload, {
      secret: this.configService.getOrThrow('auth.jwtSecretResetPassword'),
      expiresIn: this.configService.getOrThrow('auth.expiresResetPassword'),
    });
  }

  createActivationToken(payload: JwtSummaryDto): Promise<string> {
    return this.createToken(payload, {
      secret: this.configService.getOrThrow('auth.jwtSecretActivation'),
      expiresIn: '24h',
    });
  }

  verifyToken({
    token,
    secret,
  }: {
    token: string;
    secret: string;
  }): Promise<JwtSummaryDto> {
    return this.jwtService.verifyAsync(token, { secret });
  }

  async generateTokens(
    payload: JwtSummaryDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(payload),
      this.createRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }
}
