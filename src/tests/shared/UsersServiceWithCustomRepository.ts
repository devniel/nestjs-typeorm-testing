import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './User';
import { UserRepository } from './UserCustomRepository';

@Injectable()
export class UsersServiceWithCustomRepository {
  private readonly users: User[];

  constructor(
    private readonly userRepository: UserRepository,
  ) {
    this.users = [];
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }
}
