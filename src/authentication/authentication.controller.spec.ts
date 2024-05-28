import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';
import { AuthenticationController } from './authentication.controller';
import { ProtectedRequest } from 'src/request/request.interface';
import { UserDto } from 'src/user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';

describe('AuthenticationController', () => {
  let authenticationService: jest.Mocked<Partial<AuthenticationService>>;
  let userService: jest.Mocked<Partial<UserService>>;
  let authenticationController: AuthenticationController;

  beforeEach(async () => {
    authenticationService = {
      validateUser: jest.fn(),
      alreadyHaveAccount: jest.fn(),
      googleLogin: jest.fn(),
      login: jest.fn(),
      signup: jest.fn(),
      loginWith2fa: jest.fn(),
      generateTwoFactorAuthenticationSecret: jest.fn(),
      generateQrCodeDataUrl: jest.fn(),
    };

    userService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: authenticationService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
        JwtService,
      ],
    }).compile();

    authenticationController = module.get<AuthenticationController>(
      AuthenticationController,
    );
  });

  it('should be defined', () => {
    expect(authenticationController).toBeDefined();
  });

  describe('login', () => {
    it('should login user', async () => {
      const result = {
        email: 'razaro294@gmail.com',
        accessToken: 'mlkjMlkjmkAO315OMLkjmlkfqsdfq',
      };

      const request = {} as ProtectedRequest;

      jest.spyOn(authenticationService, 'login').mockResolvedValue(result);

      await expect(authenticationController.login(request)).resolves.toEqual(
        result,
      );
    });
  });

  describe('signup', () => {
    it('should signup user', async () => {
      const result = {
        email: 'razaro294@gmail.com',
        accessToken: 'mlkjMlkjmkAO315OMLkjmlkfqsdfq',
        password: 'MKLSDJG02135901MZLKGZL',
      };

      const request = {} as UserDto;

      jest.spyOn(authenticationService, 'signup').mockResolvedValue(result);

      await expect(authenticationController.signup(request)).resolves.toEqual(
        result,
      );
    });
  });

  describe('register', () => {
    const requestMock = {
      user: {
        email: 'razaro294@gmail.com',
      },
    } as ProtectedRequest;

    const responseMock = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    const authSecretMock = {
      secret: '1MKLTMJ2P5',
      otpAuthUrl: 'otpauth://totp/test@test.com?secret=secret',
    };

    const bufferMock = Buffer.from('buffer');

    beforeEach(() => {
      authenticationService.generateTwoFactorAuthenticationSecret.mockResolvedValue(
        authSecretMock,
      );
      authenticationService.generateQrCodeDataUrl.mockResolvedValue(bufferMock);
    });

    it('should generate 2FA QR code', async () => {
      await authenticationController.register(requestMock, responseMock as any);

      expect(
        authenticationService.generateTwoFactorAuthenticationSecret,
      ).toHaveBeenCalledWith(requestMock.user);
      expect(authenticationService.generateQrCodeDataUrl).toHaveBeenCalledWith(
        authSecretMock.otpAuthUrl,
      );
      expect(responseMock.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'image/png',
      );
      expect(responseMock.send).toHaveBeenCalledWith(bufferMock);
    });
  });
});
