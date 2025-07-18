import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

it('can create an instance of auth service', async () => {
  const fakeUsersService: Partial<UsersService> = {
    find: () => Promise.resolve([]),
    create: ({ email, password }: CreateUserDto) =>
      Promise.resolve({ id: 1, email, password }),
  };

  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: UsersService,
        useValue: fakeUsersService,
      },
    ],
  }).compile();
  const service = module.get(AuthService);

  expect(service).toBeDefined();
});
