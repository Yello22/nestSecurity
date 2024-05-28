import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from './google-auth.strategy';
import { ConfigModule } from '@nestjs/config';

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [GoogleStrategy],
    }).compile();

    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('should be defined', () => {
    expect(googleStrategy).toBeDefined();
  });
});
