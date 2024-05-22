import { Jwt2faAuthGuard } from './jwt-2fa-auth.guard';

describe('Jwt2faAuthGuard', () => {
  it('should be defined', () => {
    expect(new Jwt2faAuthGuard()).toBeDefined();
  });
});
