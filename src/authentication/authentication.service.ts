import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FindUserDto } from 'src/user/dto/find-user.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { ProtectedRequest } from 'src/request/request.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const query: FindUserDto = { email };
    const [user] = await this.userService.findAll(query);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async alreadyHaveAccount(email: string): Promise<boolean> {
    const query: FindUserDto = { email };
    const [user] = await this.userService.findAll(query);
    return !!user;
  }

  async googleLogin(req: ProtectedRequest) {
    if (!req.user) {
      throw new NotFoundException('No user from Google.');
    }

    const query: FindUserDto = { email: req.user.email };
    let [user] = await this.userService.findAll(query);

    if (!user) {
      user = await this.userService.create(req.user);
    }

    const payload = {
      email: user.email,
      isGoogleAuthenticated: true,
    };

    return {
      email: payload.email,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(user: Partial<User>) {
    const payload = { email: user.email };
    return {
      email: payload.email,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signup(body: CreateUserDto) {
    const query: FindUserDto = { email: body.email };
    const [existingUser] = await this.userService.findAll(query);

    if (existingUser) {
      throw new ConflictException(
        'You already have an account. Please sign in to access.',
      );
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltOrRounds);
    const newUser = { ...body, password: hashedPassword };
    return this.userService.create(newUser);
  }

  async loginWith2fa(user: Partial<User>) {
    const payload = {
      email: user.email,
      isTwoFactorAuthenticationEnabled: !!user.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated: true,
    };

    return {
      email: payload.email,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.email,
      `${process.env.AUTH_APP_NAME}`,
      secret,
    );

    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

    return { secret, otpAuthUrl };
  }

  async generateQrCodeDataUrl(otpAuthUrl: string) {
    const base64Image = await toDataURL(otpAuthUrl);
    return Buffer.from(base64Image.split(',')[1], 'base64');
  }

  isTwoAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }
}
