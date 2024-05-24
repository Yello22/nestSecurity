import { PartialType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';
import { IsEmail, IsBoolean, IsString } from 'class-validator';

export class FindUserDto extends PartialType(User) {
  @IsString()
  id?: number;

  firstName?: string;

  @IsString()
  lastName?: string;

  @IsEmail()
  email?: string;

  @IsBoolean()
  isActive?: boolean;

  @IsBoolean()
  verified?: boolean;

  @IsBoolean()
  isTwoFactorAuthenticationEnabled?: boolean;
}
