import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        login: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }
}
