import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail,IsOptional } from 'class-validator';

export class FindUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    id: string

    @IsOptional()
    firstName: string;

    @IsOptional()
    lastName: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    isActive: boolean

    @IsOptional()
    isVerified: boolean

    @IsOptional()
    isTwoFactorAuthenticationEnabled: boolean
}
