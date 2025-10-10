import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from '@/auth/dto/sign-up.dto';
import { MakeFieldPartial } from '@/generic/interface/utility';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  create(signUpDto: MakeFieldPartial<SignUpDto, 'password'>): Promise<User> {
    const user = this.usersRepository.create(signUpDto);

    return this.usersRepository.save(user);
  }
}
