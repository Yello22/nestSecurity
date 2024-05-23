import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from 'src/user/user.module';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local/local.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { Jwt2faStrategy } from './jwt-2fa/jwt-2fa.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    Jwt2faStrategy,
  ],
  imports: [
    UserModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: {
        expiresIn: `${process.env.JWT_EXPIRES_IN}`,
      },
    }),
  ],
})
export class AuthenticationModule {}
