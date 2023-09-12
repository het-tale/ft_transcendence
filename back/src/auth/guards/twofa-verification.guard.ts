import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TwoFaVerificationGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (request.user?.is2faEnabled && !request.user?.is2faVerified) {
      throw new UnauthorizedException('verify your 2fa first');
    }

    return true;
  }
}
