import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  UseGuards,
  Request,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { ProtectedRequest } from '../request/request.interface';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './local/local-auth.guard';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from './jwt/jwt-auth-guard';
import { UserService } from '../user/user.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../user/dto/user.dto';
import { GoogleAuthGuard } from './google/google-auth.guard';

@Controller('auth')
@Serialize(UserDto)
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  @Get('google/signup')
  @UseGuards(GoogleAuthGuard)
  @HttpCode(200)
  async googleLogin() {
    /* TODO document why this async method 'googleLogin' is empty */
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req: ProtectedRequest) {
    return this.authenticationService.googleLogin(req);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async login(@Request() req: ProtectedRequest) {
    const user: Partial<User> = req.user;
    return this.authenticationService.login(user);
  }

  @Post('signup')
  signup(@Body() body: CreateUserDto) {
    return this.authenticationService.signup(body);
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async register(@Request() req: ProtectedRequest, @Response() res) {
    const { otpAuthUrl } =
      await this.authenticationService.generateTwoFactorAuthenticationSecret(
        req.user,
      );

    const imgBuffer =
      await this.authenticationService.generateQrCodeDataUrl(otpAuthUrl);

    res.setHeader('Content-Type', 'image/png');
    res.send(imgBuffer);
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Request() req: ProtectedRequest,
    @Body() body,
  ) {
    const isCodeValid = this.authenticationService.isTwoAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      req.user,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return await this.userService.turnOnTwoFactorAuthentication(req.user.id);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(@Request() req: ProtectedRequest, @Body() body) {
    const isCodeValid = this.authenticationService.isTwoAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      req.user,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.authenticationService.loginWith2fa(req.user);
  }
}
