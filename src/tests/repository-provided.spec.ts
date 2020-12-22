import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestModule } from '../lib';
import { UsersService } from './shared/UsersService';
import { User } from './shared/User';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Entity repository provided in services', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmTestModule.forTest([User])],
      providers: [UsersService],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('service for access entity should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should call the repository save() method when creating a user', async () => {
    const spyRepository = jest.spyOn(usersRepository, 'save');
    const user = new User();
    user.email = 'test@test.com';
    user.name = 'test';
    user.password = 'test';
    const createdUser = await usersService.create(user);
    expect(spyRepository).toHaveBeenCalledTimes(1);
    // It seems that the repository returns the sent entity
    expect(createdUser).toBeTruthy();
    expect(createdUser).toHaveProperty('email', user.email);
    expect(createdUser).toHaveProperty('name', user.name);
    expect(createdUser).toHaveProperty('password', user.password);
  });

  it('should call the repository find() method when calling the service', async () => {
    const spyRepository = jest.spyOn(usersRepository, 'find');
    await usersService.find({});
    expect(spyRepository).toHaveBeenCalledTimes(1);
  });
});
