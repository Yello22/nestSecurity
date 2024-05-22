import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  imports: [UserModule]
})
export class AuthenticationModule {}
