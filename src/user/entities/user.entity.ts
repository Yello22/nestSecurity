import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Column({
    default: false,
  })
  isVerified: boolean;

  @Column()
  password: string;

  @Column()
  twoFactorAuthenticationSecret: string;

  @Column({
    default: false,
  })
  isTwoFactorAuthenticationEnabled: boolean;
}
