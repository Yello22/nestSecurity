import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);
  }

  findAll(queryDto: FindUserDto) {
    const query = {...queryDto} as FindManyOptions<User>
    return this.userRepository.find(query);
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const oldUser = await this.userRepository.findOneBy({ id });
    const user = Object.assign(oldUser, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const userToRemove = await this.userRepository.findOneBy({ id });
    return this.userRepository.remove(userToRemove);
  }
}
