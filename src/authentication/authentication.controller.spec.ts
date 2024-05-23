import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { describe, beforeEach, it } from 'node:test';
import jest from 'jest';

describe('AuthenticationController', () => {
  let authenticationController: AuthenticationController;
  let authenticationService: AuthenticationService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        AuthenticationService,
        UserService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    authenticationController = module.get<AuthenticationController>(
      AuthenticationController,
    );
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    userService = module.get<UserService>(UserService);
  });

  describe('login', () => {
    it('should log in the user', async () => {
      const req = { user: { id: 1, email: 'test@example.com' } };
      const result = { accessToken: 'testToken' };
      jest.spyOn(authenticationService, 'login').mockResolvedValue(result);

      expect(await authenticationController.login(req)).toBe(result);
    });
  });

  describe('signup', () => {
    it('should sign up a new user', async () => {
      const body = { email: 'test@example.com', password: 'test123' };
      const result = { id: 1, email: 'test@example.com' };
      jest.spyOn(authenticationService, 'signup').mockResolvedValue(result);

      expect(await authenticationController.signup(body)).toBe(result);
    });
  });

  describe('2fa/generate', () => {
    it('should generate a 2FA QR code', async () => {
      const req = { user: { id: 1, email: 'test@example.com' } };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
      const otpAuthUrl =
        'otpauth://totp/SecretKey?secret=JBSWY3DPEHPK3PXP&issuer=Test';
      const imgBuffer = Buffer.from('testImage', 'base64');

      jest
        .spyOn(authenticationService, 'generateTwoFactorAuthenticationSecret')
        .mockResolvedValue({ otpAuthUrl });
      jest
        .spyOn(authenticationService, 'generateQrCodeDataUrl')
        .mockResolvedValue(imgBuffer);

      await authenticationController.register(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(res.send).toHaveBeenCalledWith(imgBuffer);
    });
  });

  describe('2fa/turn-on', () => {
    it('should turn on 2FA for the user', async () => {
      const req = { user: { id: 1, email: 'test@example.com' } };
      const body = { twoFactorAuthenticationCode: '123456' };

      jest
        .spyOn(authenticationService, 'isTwoAuthenticationCodeValid')
        .mockReturnValue(true);
      jest
        .spyOn(userService, 'turnOnTwoFactorAuthentication')
        .mockResolvedValue({ id: 1, isTwoFactorEnabled: true });

      expect(
        await authenticationController.turnOnTwoFactorAuthentication(req, body),
      ).toEqual({ id: 1, isTwoFactorEnabled: true });
    });

    it('should throw an UnauthorizedException if the code is invalid', async () => {
      const req = { user: { id: 1, email: 'test@example.com' } };
      const body = { twoFactorAuthenticationCode: '123456' };

      jest
        .spyOn(authenticationService, 'isTwoAuthenticationCodeValid')
        .mockReturnValue(false);

      await expect(
        authenticationController.turnOnTwoFactorAuthentication(req, body),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('2fa/authenticate', () => {
    it('should authenticate a user with 2FA', async () => {
      const req = { user: { id: 1, email: 'test@example.com' } };
      const body = { twoFactorAuthenticationCode: '123456' };
      const result = { accessToken: 'testToken' };

      jest
        .spyOn(authenticationService, 'isTwoAuthenticationCodeValid')
        .mockReturnValue(true);
      jest
        .spyOn(authenticationService, 'loginWith2fa')
        .mockResolvedValue(result);

      expect(await authenticationController.authenticate(req, body)).toBe(
        result,
      );
    });

    it('should throw an UnauthorizedException if the code is invalid', async () => {
      const req = { user: { id: 1, email: 'test@example.com' } };
      const body = { twoFactorAuthenticationCode: '123456' };

      jest
        .spyOn(authenticationService, 'isTwoAuthenticationCodeValid')
        .mockReturnValue(false);

      await expect(
        authenticationController.authenticate(req, body),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
