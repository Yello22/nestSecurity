import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Jwt2faAuthGuard extends AuthGuard('jwt-2fa') {}
