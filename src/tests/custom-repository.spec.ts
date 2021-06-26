import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestModule } from '../lib';
import { User } from './shared/User';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from './shared/UserCustomRepository';
import { UsersServiceWithCustomRepository } from './shared/UsersServiceWithCustomRepository';

describe('Custom repository provided', () => {
  let usersCustomRepository: UserRepository;
  let usersService: UsersServiceWithCustomRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmTestModule.forTest([UserRepository])],
      providers: [UsersServiceWithCustomRepository],
    }).compile();
    usersService = module.get(UsersServiceWithCustomRepository);
    usersCustomRepository = module.get(getRepositoryToken(User));
  });

  it('repository for access entity should be defined', () => {
    expect(usersCustomRepository).toBeDefined();
  });

  it('should call the parent class method findOne() when calling instance findByEmail()', async () => {
    const spyfindOne = jest.spyOn(usersCustomRepository, 'findOne');
    await usersCustomRepository.findByEmail('test');
    expect(spyfindOne).toHaveBeenCalledTimes(1);
  });

  it('should call the repository findByEmail() method when calling the service', async () => {
    const spyRepository = jest.spyOn(usersCustomRepository, 'findByEmail');
    await usersService.findByEmail('test');
    expect(spyRepository).toHaveBeenCalledTimes(1);
  });
});
