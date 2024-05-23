import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: '',
  })
  firstName: string;

  @Column({
    default: '',
  })
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

  @Column({
    default: '',
  })
  twoFactorAuthenticationSecret: string;

  @Column({
    default: false,
  })
  isTwoFactorAuthenticationEnabled: boolean;
}
