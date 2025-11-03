import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user.entity';
import { Repository } from 'typeorm';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<User> {
    const { userId, updateData } = command;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateFields: Partial<User> = {};

    if (updateData.avatar !== undefined) {
      updateFields.avatar = updateData.avatar;
    }

    if (updateData.username !== undefined) {
      updateFields.username = updateData.username;
    }

    if (updateData.position !== undefined) {
      updateFields.position = updateData.position;
    }

    if (updateData.location !== undefined) {
      updateFields.location = updateData.location;
    }

    if (Object.keys(updateFields).length === 0) {
      return user;
    }

    await this.userRepository.update(userId, updateFields);

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }
}

export type UpdateProfileCommandResponse = ReturnType<
  UpdateProfileHandler['execute']
>;
