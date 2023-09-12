import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class Jwt2faAuthenticationGuard extends AuthGuard('jwt') {}
