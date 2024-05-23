import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
