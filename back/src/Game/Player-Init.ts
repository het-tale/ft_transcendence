import { ConsoleLogger, HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";

export async function  verifyToken(token: string | string[] , prisma : PrismaService, conf: ConfigService, jwt : JwtService){
    if (token instanceof Array) {
      throw new HttpException('invalid token', 400);
    }
    const payload = await jwt.verify(token, {
      secret: conf.get('ACCESS_TOKEN_JWT_SECRET'),
    });
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (!user) {
      throw new HttpException('user not found', 404);
    }
    return user;
  }