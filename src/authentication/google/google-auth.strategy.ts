import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: `${process.env.GOOGLE_AUTH_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_AUTH_SECRET_CODE_CLIENT}`,
      callbackURL: `${process.env.GOOGLE_AUTH_CALLBACK_URL}`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      access_token: accessToken,
    };

    done(null, user);
  }
}
