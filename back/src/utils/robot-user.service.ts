import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as argon from 'argon2';

@Injectable()
export class RobotUserService {
  constructor(
    private readonly prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createRobotUser() {
    let robotUser: User;
    robotUser = await this.prisma.user.findUnique({
      where: {
        username: 'ROBOT',
      },
    });
    if (robotUser) {
      return;
    }
    const avatar = this.config.get('ROBOT_AVATAR');
    const password = this.config.get('ROBOT_PASSWORD');
    console.log(password);
    let hashedPassword = null;
    if (password)
      hashedPassword = await argon.hash(password);
    robotUser = await this.prisma.user.create({
      data: {
        username: 'ROBOT',
        email: 'robot.fake@gmail.com',
        isEmailConfirmed: true,
        avatar,
        status: 'online',
        hash: hashedPassword,
      },
    });
    if (!robotUser) {
      throw new Error('Error creating robot user');
    }
  }
}
