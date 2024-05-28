import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

jest.mock('bcrypt');
jest.mock('otplib');
jest.mock('qrcode');

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  let userService: Partial<UserService>;
  let jwtService: JwtService;

  beforeEach(async () => {
    userService = {
      findAll: jest.fn(),
      create: jest.fn(),
      setTwoFactorAuthenticationSecret: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        JwtService,
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  it('can create an instance of auth service', () => {
    expect(authenticationService).toBeDefined();
  });

  describe('signup', () => {
    it('creates a new user with a salted and hashed password using bcrypt', async () => {
      const userBody: CreateUserDto = {
        email: 'test@test.com',
        password: '123456',
      };

      const token = 'MKPOAIG01295801PKP24681JDSL';

      const hashedPassword = 'somehashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      (userService.findAll as jest.Mock).mockResolvedValue([]);
      (userService.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...userBody,
        password: hashedPassword,
      });

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const user = await authenticationService.signup(userBody);

      expect(user.password).not.toEqual('123456');
      expect(bcrypt.hash).toHaveBeenCalledWith(userBody.password, 10);
      expect(user.password).toEqual(hashedPassword);
    });

    it('throws a ConflictException if the email already exists', async () => {
      const userBody: CreateUserDto = {
        email: 'test@test.com',
        password: '123456',
      };

      (userService.findAll as jest.Mock).mockResolvedValue([userBody as User]);

      await expect(authenticationService.signup(userBody)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    it('validates a user with correct credentials', async () => {
      const email = 'test@test.com';
      const password = '123456';
      const hashedPassword = 'somehashedpassword';

      (userService.findAll as jest.Mock).mockResolvedValue([
        { email, password: hashedPassword } as User,
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const user = await authenticationService.validateUser(email, password);

      expect(user).toBeDefined();
      expect(user.email).toEqual(email);
    });

    it('throws UnauthorizedException for invalid credentials', async () => {
      const email = 'test@test.com';
      const password = '123456';

      (userService.findAll as jest.Mock).mockResolvedValue([]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authenticationService.validateUser(email, password),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('googleLogin', () => {
    it('logs in a user with Google', async () => {
      const req = { user: { email: 'test@test.com' } } as any;
      const user = { email: 'test@test.com' } as User;

      (userService.findAll as jest.Mock).mockResolvedValue([user]);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await authenticationService.googleLogin(req);

      expect(result.email).toEqual(user.email);
      expect(result.accessToken).toEqual('token');
    });

    it('creates a user if not existing and logs in with Google', async () => {
      const req = { user: { email: 'test@test.com' } } as any;
      const newUser = { email: 'test@test.com' } as User;

      (userService.findAll as jest.Mock).mockResolvedValue([]);
      (userService.create as jest.Mock).mockResolvedValue(newUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await authenticationService.googleLogin(req);

      expect(result.email).toEqual(newUser.email);
      expect(result.accessToken).toEqual('token');
    });

    it('throws NotFoundException if no user from Google', async () => {
      const req = { user: null } as any;

      await expect(authenticationService.googleLogin(req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateTwoFactorAuthenticationSecret', () => {
    it('generates a 2FA secret and OTP auth URL', async () => {
      const user = { email: 'test@test.com', id: 1 } as User;
      const secret = 'secret';
      const otpAuthUrl = 'otpauth://totp/test@test.com?secret=secret';

      (authenticator.generateSecret as jest.Mock).mockReturnValue(secret);
      (authenticator.keyuri as jest.Mock).mockReturnValue(otpAuthUrl);
      (
        userService.setTwoFactorAuthenticationSecret as jest.Mock
      ).mockResolvedValue(void 0);

      const result =
        await authenticationService.generateTwoFactorAuthenticationSecret(user);

      expect(result.secret).toEqual(secret);
      expect(result.otpAuthUrl).toEqual(otpAuthUrl);
      expect(userService.setTwoFactorAuthenticationSecret).toHaveBeenCalledWith(
        secret,
        user.id,
      );
    });
  });

  describe('generateQrCodeDataUrl', () => {
    it('generates a QR code data URL', async () => {
      const otpAuthUrl = 'otpauth://totp/test@test.com?secret=secret';
      const base64Image = 'data:image/png;base64,encodedimage';

      (toDataURL as jest.Mock).mockResolvedValue(base64Image);

      const result =
        await authenticationService.generateQrCodeDataUrl(otpAuthUrl);

      expect(result).toEqual(Buffer.from(base64Image.split(',')[1], 'base64'));
    });
  });

  describe('isTwoAuthenticationCodeValid', () => {
    it('validates the 2FA code correctly', () => {
      const twoFactorAuthenticationCode = '123456';
      const user = { twoFactorAuthenticationSecret: 'secret' } as User;

      (authenticator.verify as jest.Mock).mockReturnValue(true);

      const isValid = authenticationService.isTwoAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        user,
      );

      expect(isValid).toBe(true);
    });
  });
});
