import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(queryDto: FindUserDto): Promise<User[]> {
    const query: FindManyOptions<User> = {};
    if (queryDto) {
      query.where = queryDto;
    }

    return this.userRepository.find(query);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    await this.userRepository.remove(user);
  }

  async setTwoFactorAuthenticationSecret(secret: string, id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    user.twoFactorAuthenticationSecret = secret;
    return this.userRepository.save(user);
  }

  async turnOnTwoFactorAuthentication(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.isTwoFactorAuthenticationEnabled = true;
    return this.userRepository.save(user);
  }
}
