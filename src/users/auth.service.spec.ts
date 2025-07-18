import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let users: User[] = [];

  beforeEach(async () => {
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email == email);
        return Promise.resolve(filteredUsers);
      },
      create: ({ email, password }: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        };
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });
  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });
  it('creates a new user with as salted and hashed password', async () => {
    const user = await service.signup({
      email: 'asdf@asdf.com',
      password: 'asdf',
    });
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  it('throws an error if user sign up with email that is in use', async () => {
    fakeUsersService.find = () => {
      return Promise.resolve([{ id: 1, email: 'a', password: '1' }]);
    };
    await expect(service.signup({ email: 'a', password: '1' })).rejects.toThrow(
      BadRequestException,
    );
  });
  it('throws if signin is called with an unused email', async () => {
    await expect(service.signin({ email: 'a', password: '1' })).rejects.toThrow(
      NotFoundException,
    );
  });
  it('throws if an invalid password is provided', async () => {
    fakeUsersService.find = () => {
      return Promise.resolve([{ id: 1, email: 'a', password: '2' }]);
    };
    await expect(service.signin({ email: 'a', password: '1' })).rejects.toThrow(
      BadRequestException,
    );
  });
  it('return a user if correct password is provided', async () => {
    await service.signup({
      email: 'aaaa@bbb.com',
      password: 'password',
    });
    const user = await service.signin({
      email: 'aaaa@bbb.com',
      password: 'password',
    });
    expect(user).toBeDefined();
  });
});
