import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveTokenCommand } from './save-token.command';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@CommandHandler(SaveTokenCommand)
export class SaveTokenHandler implements ICommandHandler<SaveTokenCommand> {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async execute(command: SaveTokenCommand): Promise<void> {
    const { key, token, expirationSeconds } = command;

    await this.redisClient.setex(key, expirationSeconds, token);
  }
}

export type SaveTokenCommandResponse = ReturnType<SaveTokenHandler['execute']>;
