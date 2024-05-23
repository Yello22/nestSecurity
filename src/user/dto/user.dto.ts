import { Expose, Exclude } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  access_token: string;

  @Exclude()
  password: string;
}
