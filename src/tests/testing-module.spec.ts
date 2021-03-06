import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestModule, FakeConnection } from '../lib';
import { UsersService } from './shared/UsersService';
import { User } from './shared/User';
import { Connection, Repository } from 'typeorm';
import { getConnectionToken, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import * as typeorm from 'typeorm';

const CONNECTION_1_NAME = 'default1';
const CONNECTION_2_NAME = 'default2';
const CONNECTION_3_NAME = 'default3';

@Injectable()
export class UsersServiceConnection1 {
  private readonly users: User[];

  constructor(
    @InjectRepository(User, CONNECTION_1_NAME)
    private readonly userRepository: Repository<User>,
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

@Injectable()
export class UsersServiceConnection2 {
  private readonly users: User[];

  constructor(
    @InjectRepository(User, CONNECTION_2_NAME)
    private readonly userRepository: Repository<User>,
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

describe('Create multiple testing modules', () => {
  it('should create multiple testing modules when using different names', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestModule.forTest({
          entities: [User],
          name: CONNECTION_1_NAME,
        }),
      ],
      providers: [UsersServiceConnection1],
    }).compile();
    const connection: FakeConnection = module.get(
      getConnectionToken(CONNECTION_1_NAME),
    );
    expect(connection).toBeTruthy();
    expect(connection.name).toBeTruthy();
    const module2: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestModule.forTest({
          entities: [User],
          name: CONNECTION_2_NAME,
        }),
      ],
      providers: [UsersServiceConnection2],
    }).compile();
    const connection2: FakeConnection = module2.get(
      getConnectionToken(CONNECTION_2_NAME),
    );
    expect(connection2).toBeTruthy();
    expect(connection2.name).toBeTruthy();
    expect(connection.name).not.toEqual(connection2.name);
    await module.close();
    await module2.close();
  });
  it('should return error while creating the same connection based on its name', async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmTestModule.forTest([User])],
      providers: [UsersService],
    }).compile();
    try {
      await Test.createTestingModule({
        imports: [TypeOrmTestModule.forTest([User])],
        providers: [UsersService],
      }).compile();
    } catch (e) {
      expect(e).toBeTruthy();
    }
    await module.close();
  });
  it('should disconnect and then use a connection of the same name', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestModule.forTest({
          entities: [User],
          name: CONNECTION_3_NAME,
        }),
      ],
    }).compile();
    const connection = module.get<Connection>(
      getConnectionToken(CONNECTION_3_NAME),
    );
    await module.close();
    const module2: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestModule.forTest({
          entities: [User],
          name: CONNECTION_3_NAME,
        }),
      ],
    }).compile();
    expect(module2).toBeTruthy();
    await module2.close();
  });
  it('should restore stub of typeorm when closing the testing module', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestModule.forTest({
          entities: [User],
          name: CONNECTION_3_NAME,
        }),
      ],
    }).compile();
    const connection = module.get<Connection>(
      getConnectionToken(CONNECTION_3_NAME),
    );
    expect(typeorm.createConnection).not.toHaveProperty('restore');
  });
});
