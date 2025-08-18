import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from '@/auth/dto/sign-up.dto';

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

  createUser(signUpDto: SignUpDto): Promise<User> {
    const user = this.usersRepository.create({
      email: signUpDto.email,
      password: signUpDto.password,
    });

    return this.usersRepository.save(user);
  }

  create(signUpDto: SignUpDto): Promise<User> {
    const user = this.usersRepository.create(signUpDto);
    return this.usersRepository.save(user);
  }
}
