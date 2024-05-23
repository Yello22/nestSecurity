import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: any) {
    const [user] = await this.userService.findAll({ email: payload.email });
    if (!user.isTwoFactorAuthenticationEnabled) {
      return user;
    }

    if (payload.isTwoFactorAuthenticated) {
      return user;
    }
  }
}
