import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestModule } from '../lib';
import { UsersService } from './shared/UsersService';
import { User } from './shared/User';

describe('Entity repository provided in services', () => {
  let usersService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmTestModule.forTest([User])],
      providers: [UsersService],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
  });

  it('service for access entity should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should save the created user', async () => {
    const user = new User();
    user.email = 'test@test.com';
    user.name = 'test';
    user.password = 'test';
    const createdUser = await usersService.create(user);
    console.log('createdUser:', createdUser);
  });
});
