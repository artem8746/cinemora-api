import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserPasswordCommand } from './update-user-password.command';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from '@/utils/hash-passwords';

@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordHandler implements ICommandHandler<UpdateUserPasswordCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: UpdateUserPasswordCommand): Promise<void> {
    const { userId, newPassword } = command;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await hashPassword(newPassword);

    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }
}

export type UpdateUserPasswordCommandResponse = ReturnType<
  UpdateUserPasswordHandler['execute']
>;
