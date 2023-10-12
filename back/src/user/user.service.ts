import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include:{
        blocked: true,
      }

    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }

}
