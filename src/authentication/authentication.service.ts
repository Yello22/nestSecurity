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

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const query: FindUserDto = { email };

    const [user] = await this.userService.findAll(query);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    const { password: _, ...result } = user;
    return result;
  }

  async alreadyHaveAccount(email: string): Promise<boolean> {
    const query: FindUserDto = { email };

    const [user] = await this.userService.findAll(query);

    if (!user) {
      return false;
    }

    return true;
  }

  async googleLogin(req) {
    if (!req.user) {
      return new NotFoundException('No user from google');
    }

     const query: FindUserDto = { req.user.email };

    const [user] = await this.userService.findAll(query) 
    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  async login(user: Partial<User>) {
    const payload = {
      email: user.email,
    };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(body: CreateUserDto) {
    const query: FindUserDto = { email: body.email };
    const [existingUser] = await this.userService.findAll(query);

    if (existingUser) {
      throw new ConflictException(
        'You already have an account, please sign in to get access.',
      );
    }

    const saltOrRounds = 10;
    body.password = await bcrypt.hash(body.password, saltOrRounds);
    return this.userService.create(body);
  }

  async loginWith2fa(user: Partial<User>) {
    const payload = {
      email: user.email,
      isTwoFactorAuthenticationEnabled: !!user.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated: true,
    };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
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

    return {
      secret,
      otpAuthUrl,
    };
  }

  async generateQrCodeDataUrl(otpAuthUrl: string) {
    const base64Image = await toDataURL(otpAuthUrl);
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
    return Buffer.from(base64Data, 'base64');
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
