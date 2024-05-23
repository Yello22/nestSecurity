import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from '../entities/token-payload.entity';
import { FindUserDto } from 'src/user/dto/find-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: TokenPayload) {
    const query: FindUserDto = { email: payload.email };
    const [user] = await this.userService.findAll(query);
    if (user) {
      return user;
    }
  }
}
