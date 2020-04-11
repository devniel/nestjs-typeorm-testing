import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './User';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    this.users = [];
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async find(query): Promise<User[]> {
    return this.userRepository.find(query);
  }

  async findOne(query): Promise<User> {
    return this.userRepository.findOne(query);
  }

  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
