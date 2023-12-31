import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}
  async getFriends(user: User) {
    const dbUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        friends: {
          select: {
            id: true,
            username: true,
            avatar: true,
            status: true,
            email: true,
            login: true,
          },
        },
      },
    });

    return dbUser.friends;
  }
  async getBlockedUsers(user: User) {
    const dbUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            avatar: true,
            status: true,
            email: true,
            login: true,
          },
        },
      },
    });

    return dbUser.blocked;
  }
  async getMutualFriends(username: string, user: User) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        friends: true,
      },
    });
    const otherUser = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        friends: {
          select: {
            id: true,
            username: true,
            avatar: true,
            status: true,
            email: true,
            login: true,
          },
        },
      },
    });
    if (!otherUser) {
      throw new HttpException('User not found.', 404);
    }
    const mutualFriends = otherUser.friends.filter((friend) =>
      currentUser.friends.find((f) => f.id === friend.id),
    );

    return mutualFriends;
  }
  async handleFriendRequest(
    clientUsername: string,
    receiverUsername: string,
    isAccepted: boolean,
    isOnline: boolean,
  ) {
    const status = isAccepted ? 'accepted' : 'rejected';
    const client = await this.prisma.user.findUnique({
      where: {
        username: clientUsername,
      },
    });
    const receiver = await this.prisma.user.findUnique({
      where: {
        username: receiverUsername,
      },
    });
    if (!client || !receiver) {
      throw new Error('User not found.');
    }
    const friendRequest = await this.prisma.friendRequest.findFirst({
      where: {
        senderId: receiver.id,
        receiverId: client.id,
        status: 'pending',
      },
    });
    if (!friendRequest) {
      throw new Error('Friend request not found.');
    }

    await this.prisma.friendRequest.update({
      where: {
        id: friendRequest.id,
      },
      data: {
        status,
        isReceiverOnline: isOnline,
      },
    });
    if (isAccepted) {
      await this.prisma.user.update({
        where: {
          id: client.id,
        },
        data: {
          friends: {
            connect: {
              id: receiver.id,
            },
          },
        },
      });
      await this.prisma.user.update({
        where: {
          id: receiver.id,
        },
        data: {
          friends: {
            connect: {
              id: client.id,
            },
          },
        },
      });
    }
  }
  async removeFriend(clientUsername: string, friendUsername: string) {
    const client = await this.prisma.user.findUnique({
      where: {
        username: clientUsername,
      },
      include: {
        friends: true,
      },
    });
    const friend = await this.prisma.user.findUnique({
      where: {
        username: friendUsername,
      },
    });
    if (!client || !friend) {
      throw new Error('User not found.');
    }
    const isFriend = client.friends.find((f) => f.id === friend.id);
    if (!isFriend) {
      throw new Error('User is not your friend.');
    }
    await this.prisma.user.update({
      where: {
        id: client.id,
      },
      data: {
        friends: {
          disconnect: {
            id: friend.id,
          },
        },
      },
    });
    await this.prisma.user.update({
      where: {
        id: friend.id,
      },
      data: {
        friends: {
          disconnect: {
            id: client.id,
          },
        },
      },
    });
  }
  async blockUser(clientUsername: string, blockedUsername: string) {
    const client = await this.prisma.user.findUnique({
      where: {
        username: clientUsername,
      },
      include: {
        blocked: true,
        friends: true,
      },
    });
    const blocked = await this.prisma.user.findUnique({
      where: {
        username: blockedUsername,
      },
    });
    if (!client || !blocked) {
      throw new Error('User not found.');
    }
    const isBlocked = client.blocked.find((b) => b.id === blocked.id);
    if (isBlocked) {
      throw new Error('User is already blocked.');
    }
    await this.prisma.user.update({
      where: {
        id: client.id,
      },
      data: {
        blocked: {
          connect: {
            id: blocked.id,
          },
        },
      },
    });
    const isFriend = client.friends.find((f) => f.id === blocked.id);
    if (isFriend) {
      await this.prisma.user.update({
        where: {
          id: client.id,
        },
        data: {
          friends: {
            disconnect: {
              id: blocked.id,
            },
          },
        },
      });
      await this.prisma.user.update({
        where: {
          id: blocked.id,
        },
        data: {
          friends: {
            disconnect: {
              id: client.id,
            },
          },
        },
      });
    }
  }
  async unblockUser(clientUsername: string, blockedUsername: string) {
    const client = await this.prisma.user.findUnique({
      where: {
        username: clientUsername,
      },
      include: {
        blocked: true,
      },
    });
    const blocked = await this.prisma.user.findUnique({
      where: {
        username: blockedUsername,
      },
    });
    if (!client || !blocked) {
      throw new Error('User not found.');
    }
    const isBlocked = client.blocked.find((b) => b.id === blocked.id);
    if (!isBlocked) {
      throw new Error('User is not blocked.');
    }
    await this.prisma.user.update({
      where: {
        id: client.id,
      },
      data: {
        blocked: {
          disconnect: {
            id: blocked.id,
          },
        },
      },
    });
  }
}
