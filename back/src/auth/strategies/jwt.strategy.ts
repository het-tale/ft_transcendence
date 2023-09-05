import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exclude } from 'utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService, private conf: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: conf.get('ACCESS_TOKEN_JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; username: string; email: string }) {
    const id = payload.sub;
    const user = await this.prisma.user.findUnique({ where: { id } });
    //Based on the way JWT signing works, we're guaranteed that we're receiving a valid token that we have previously signed and issued to a valid user.
    //here passport create an object based on the return and invoke it in the request to the corresponding route as request.user

    return exclude(user, 'hash');
  }
}
