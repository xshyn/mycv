import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(createUserDto: CreateUserDto) {
    return this.repo.save(createUserDto);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const updateResult: UpdateResult = await this.repo.update(
      id,
      updateUserDto,
    );
    if (updateResult.affected === 0) throw new NotFoundException();
    return this.repo.findBy({ id });
  }

  async remove(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException();
    this.repo.delete(id);
    return user;
  }
}
