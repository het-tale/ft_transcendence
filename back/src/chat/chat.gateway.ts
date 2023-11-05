import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { DMService } from './dm.service';
import { ChannelService } from './channel.service';
import { FriendsService } from './friends.service';
import {
  TCreateRoom,
  TDM,
  TFriendReq,
  TInvitation,
  TLeaveRoom,
  TRoom,
  TRoomMessage,
  TRoomTarget,
  TUserTarget,
  TUsername,
} from 'src/dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AchievementsService } from './achievements.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { BadRequestTransformationFilter } from './validation.filter';
import { ChatbotService } from 'src/chatbot/chatbot.service';

@UseFilters(BadRequestTransformationFilter)
@UsePipes(new ValidationPipe({ transform: true }))
@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private dmService: DMService,
    private channelService: ChannelService,
    private friendsService: FriendsService,
    private achievementsService: AchievementsService,
    private chatbotService: ChatbotService,
  ) {}
  @WebSocketServer() io: Server;
  private connectedUsers: { clientId: string; username: string }[] = [];

  afterInit() {
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.auth.token ?? client.handshake.headers.token;
    try {
      const user = await this.dmService.verifyToken(token);
      if (!user.username) {
        throw new Error('Username must be provided');
      }
      this.connectedUsers.push({
        clientId: client.id,
        username: user.username,
      });
      await this.dmService.changeUserStatus(user.username, 'online');
      this.io.emit('userOnline', client.id);
      await this.channelService.rejoinRooms(user.id, client);
      const offlineMessages = await this.dmService.getOfflineMessages(user.id);
      const offlineInvitations =
        await this.channelService.getOfflineInvitations(user.id);
      const offlineChannelMessages =
        await this.channelService.getOfflineChannelMessages(user.id);
      const offlineFriendRequests =
        await this.dmService.getOfflineFriendRequests(user.id);
      const offlineAchievements =
        await this.achievementsService.getOfflineAchievements(user.username);
      if (offlineChannelMessages.length > 0) {
        client.emit('offlineChannelMessages', offlineChannelMessages);
        await this.channelService.deleteOfflineChannelMessages(
          offlineChannelMessages,
        );
      }
      if (offlineMessages.length > 0) {
        client.emit('offlineMessages', offlineMessages);
        await this.dmService.changeOfflineMessagesStatus(offlineMessages);
      }
      if (offlineInvitations.length > 0) {
        client.emit('offlineInvitations', offlineInvitations);
        await this.channelService.changeOfflineInvitationsStatus(
          offlineInvitations,
        );
      }
      if (offlineFriendRequests.length > 0) {
        client.emit('offlineFriendRequests', offlineFriendRequests);
        await this.dmService.changeOfflineFriendRequestsStatus(
          offlineFriendRequests,
        );
      }
      if (offlineAchievements.length > 0) {
        client.emit('offlineAchievements', offlineAchievements);
        await this.achievementsService.removeOfflineAchievements(user.username);
      }
    } catch (err) {
      client.disconnect();
      console.error('Authentication failed:', err.message);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = this.connectedUsers.find(
      (user) => user.clientId === client.id,
    );
    if (!user) return;
    await this.dmService.changeUserStatus(user.username, 'offline');
    this.io.emit('userOffline', client.id);
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user.clientId !== client.id,
    );
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: TDM,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (data.message === '') return;
      const sender = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      const receiver = this.connectedUsers.find(
        (user) => user.username === data.to,
      );

      const sentAt = new Date();
      let isPending = true;
      if (receiver || data.to === 'ROBOT') isPending = false;
      await this.dmService.saveMessage({
        sender: sender.username,
        receiver: data.to,
        message: data.message,
        date: sentAt,
        isPending,
      });
      if (receiver) {
        this.io.to(receiver.clientId).emit('privateMessage', {
          from: sender.username,
          message: data.message,
        });
      }
      this.io.to(client.id).emit('privateMessage', {
        from: sender.username,
        message: data.message,
      });
      if (data.to === 'ROBOT') {
        await this.dmService.handleRobotResponse(data.message, sender.username);
        this.io.to(client.id).emit('privateMessage', {
          from: 'ROBOT',
          message: '...',
        });
      }
      const obj = await this.achievementsService.check100SentMessages(
        sender.username,
      );
      if (obj.isUnlocked)
        this.io.to(client.id).emit('achievementUnlocked', obj.achievement);
    } catch (err) {
      client.emit('privateMessageError', err.message);
    }
  }
  @SubscribeMessage('createRoom')
  async createRoom(
    @MessageBody() data: TCreateRoom,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const owner = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      await this.channelService.createChannel(
        data.room,
        owner.username,
        data.type,
        data.password ? data.password : null,
      );
      client.join(data.room);
      this.io.to(data.room).emit('roomCreated', { room: data.room });
      const obj = await this.achievementsService.check20Channels(
        owner.username,
      );
      if (obj.isUnlocked)
        this.io.to(client.id).emit('achievementUnlocked', obj.achievement);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002')
          err.message = 'this channel name is already taken';
      }
      client.emit('roomCreateError', err.message);
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() data: TRoom,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      await this.channelService.joinChannel(
        data.room,
        user.username,
        data.password ? data.password : null,
      );
      client.join(data.room);
      const obj = await this.achievementsService.check20Channels(user.username);
      if (obj.isUnlocked)
        this.io.to(client.id).emit('achievementUnlocked', obj.achievement);
      this.io.to(data.room).emit('roomJoined', `${user.username} joined`);
    } catch (err) {
      client.emit('roomJoinError', err.message);
    }
  }

  @SubscribeMessage('sendRoomMessage')
  async sendRoomMessage(
    @MessageBody() data: TRoomMessage,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const sender = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      const sentAt = new Date();
      await this.channelService.saveMessagetoChannel({
        sender: sender.username,
        room: data.room,
        message: data.message,
        date: sentAt,
      });
      await this.channelService.createOfflineChannelMessages(
        this.connectedUsers,
        data.room,
        data.message,
        sender.username,
        sentAt,
      );
      //dont emit to blocked online users
      const recipients = await this.channelService.getRecipients(
        data.room,
        sender.username,
      );
      for (const recipient of recipients) {
        const user = this.connectedUsers.find(
          (user) => user.username === recipient.username,
        );
        if (user) {
          this.io.to(user.clientId).emit('roomMessage', data.message);
        }
      }
      const obj = await this.achievementsService.check100SentMessages(
        sender.username,
      );
      if (obj.isUnlocked)
        this.io.to(client.id).emit('achievementUnlocked', obj.achievement);
    } catch (err) {
      client.emit('roomMessageError', err.message);
    }
  }
  @SubscribeMessage('sendRoomInvitation')
  async sendRoomInvitation(
    @MessageBody() data: TRoomTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const sender = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      const receiver = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      let isReceiverOnline = false;
      if (receiver) isReceiverOnline = true;
      await this.channelService.saveInvitation({
        sender: sender.username,
        receiver: data.target,
        room: data.room,
        isReceiverOnline,
      });
      if (receiver) {
        this.io.to(receiver.clientId).emit('roomInvitation', {
          from: sender.username,
          room: data.room,
        });
      }
    } catch (err) {
      client.emit('roomInvitationError', err.message);
    }
  }
  @SubscribeMessage('handleRoomInvitation')
  async handleRoomInvitation(
    @MessageBody() data: TInvitation,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.channelService.handleChannelInvitation({
        sender: data.from,
        receiver: clientUsername,
        room: data.room,
        isAccepted: data.isAccepted,
      });
      if (data.isAccepted) {
        client.join(data.room);
        this.io
          .to(data.room)
          .emit('roomJoined', `${clientUsername} joind ${data.room}`);
      } else {
        client.to(data.room).emit('roomInvitationDeclined', data.room);
      }
    } catch (err) {
      client.emit('roomInvitationError', err.message);
    }
  }
  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @MessageBody() data: TLeaveRoom,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.channelService.leaveChannel(data, clientUsername);
      client.leave(data.room);
      this.io.to(data.room).emit('roomLeft', `${clientUsername} left`);
    } catch (err) {
      client.emit('roomLeaveError', err.message);
    }
  }
  @SubscribeMessage('kickUser')
  async kickUser(
    @MessageBody() data: TRoomTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      const kickedUser = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      await this.channelService.kickUser(
        data.room,
        clientUsername,
        data.target,
      );
      this.io.to(data.room).emit('userKicked', `${data.target} kicked`);
      if (kickedUser) {
        const sockets = await this.io.in(kickedUser.clientId).fetchSockets();
        if (sockets) {
          sockets.forEach((socket) => {
            socket.leave(data.room);
          });
        }
      }
    } catch (err) {
      client.emit('userKickError', err.message);
    }
  }
  @SubscribeMessage('addAdmin')
  async addAdmin(
    @MessageBody() data: TRoomTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.channelService.addAdmin(
        data.room,
        clientUsername,
        data.target,
      );
      this.io.to(data.room).emit('adminAdded', `${data.target} is admin now`);
    } catch (err) {
      return { event: 'adminAddError', error: err.message };
    }
  }
  @SubscribeMessage('banneUser')
  async banneUser(
    @MessageBody() data: TRoomTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      const bannedUser = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      await this.channelService.banUser(data.room, clientUsername, data.target);
      this.io.to(data.room).emit('userBanned', `${data.target} banned`);
      if (bannedUser) {
        const sockets = await this.io.in(bannedUser.clientId).fetchSockets();
        if (sockets) {
          sockets.forEach((socket) => {
            socket.leave(data.room);
          });
        }
      }
    } catch (err) {
      client.emit('userBanError', err.message);
    }
  }
  @SubscribeMessage('unbanUser')
  async unbanUser(
    @MessageBody() data: TRoomTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      const unbannedUser = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      await this.channelService.unbanUser(
        data.room,
        clientUsername,
        data.target,
      );
      if (unbannedUser) {
        const sockets = await this.io.in(unbannedUser.clientId).fetchSockets();
        if (sockets) {
          sockets.forEach((socket) => {
            socket.join(data.room);
          });
        }
      }
      this.io.to(data.room).emit('userUnbanned', `${data.target} unbanned`);
    } catch (err) {
      client.emit('userUnbanError', err.message);
    }
  }
  @SubscribeMessage('muteUser')
  async muteUser(
    @MessageBody() data: TRoomTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.channelService.muteUser(
        data.room,
        clientUsername,
        data.target,
      );
      this.io.to(data.room).emit('userMuted', `${data.target} muted`);
    } catch (err) {
      client.emit('userMuteError', err.message);
    }
  }
  @SubscribeMessage('unmuteUser')
  async unmuteUser(
    @MessageBody() data: TRoomTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.channelService.unmuteUser(
        data.room,
        clientUsername,
        data.target,
      );
      this.io.to(data.room).emit('userUnmuted', `${data.target} unmuted`);
    } catch (err) {
      client.emit('userUnmuteError', err.message);
    }
  }
  @SubscribeMessage('sendFriendRequest')
  async addFriend(
    @MessageBody() data: TUserTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      const receiver = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      let isOnline = false;
      if (receiver) isOnline = true;
      await this.dmService.sendFriendRequest(
        clientUsername,
        data.target,
        isOnline,
      );
      if (receiver) {
        this.io.to(receiver.clientId).emit('frienRequest', {
          from: clientUsername,
        });
      }
      this.io.to(client.id).emit('friendRequestSent');
    } catch (err) {
      client.emit('friendRequestError', err.message);
    }
  }
  @SubscribeMessage('handleFriendRequest')
  async handleFriendRequest(
    @MessageBody() data: TFriendReq,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user1 = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      const clientUsername = user1.username;
      const receiver = this.connectedUsers.find(
        (user) => user.username === data.from,
      );
      let isOnline = false;
      if (receiver) isOnline = true;
      await this.friendsService.handleFriendRequest(
        clientUsername,
        data.from,
        data.isAccepted,
        isOnline,
      );
      if (data.isAccepted) {
        const obj = await this.achievementsService.check20friends(
          clientUsername,
        );
        if (obj.isUnlocked)
          this.io.to(client.id).emit('achievementUnlocked', obj.achievement);
        this.io.to(client.id).emit('friendRequestAccepted', {
          from: data.from,
        });
        if (receiver) {
          const obj2 = await this.achievementsService.check20friends(
            receiver.username,
          );
          if (obj2.isUnlocked)
            this.io
              .to(receiver.clientId)
              .emit('achievementUnlocked', obj2.achievement);
          this.io.to(receiver.clientId).emit('friendRequestAccepted', {
            from: clientUsername,
          });
        }
      } else {
        this.io.to(client.id).emit('friendRequestDeclined', {
          from: data.from,
        });
        if (receiver) {
          this.io.to(receiver.clientId).emit('friendRequestDeclined', {
            from: clientUsername,
          });
        }
      }
    } catch (err) {
      client.emit('friendRequestError', err.message);
    }
  }
  @SubscribeMessage('removeFriend')
  async removeFriend(
    @MessageBody() data: TUserTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.friendsService.removeFriend(clientUsername, data.target);
      this.io.to(client.id).emit('friendRemoved');
    } catch (err) {
      client.emit('friendRemoveError', err.message);
    }
  }
  @SubscribeMessage('blockUser')
  async blockUser(
    @MessageBody() data: TUserTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      const target = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      await this.friendsService.blockUser(clientUsername, data.target);
      const obj = await this.achievementsService.checkFirstBlock(
        clientUsername,
      );
      if (obj.isUnlocked)
        this.io.to(client.id).emit('achievementUnlocked', obj.achievement);
      this.io.to(client.id).emit('userBlocked');
      const obj2 = await this.achievementsService.check20blocks(data.target);
      if (obj2.isUnlocked && target)
        this.io
          .to(target.clientId)
          .emit('achievementUnlocked', obj2.achievement);
    } catch (err) {
      client.emit('userBlockError', err.message);
    }
  }
  @SubscribeMessage('unblockUser')
  async unblockUser(
    @MessageBody() data: TUserTarget,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.friendsService.unblockUser(clientUsername, data.target);
      this.io.to(client.id).emit('userUnblocked');
    } catch (err) {
      client.emit('userUnblockError', err.message);
    }
  }
  @SubscribeMessage('deleteChannel')
  async deleteChannel(
    @MessageBody() data: TRoom,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.channelService.deleteChannel(
        data.room,
        clientUsername,
        this.io,
        this.connectedUsers,
        data.password ? data.password : null,
      );
      this.io.to(data.room).emit('channelDeleted');
    } catch (err) {
      client.emit('channelDeleteError', err.message);
    }
  }
  @SubscribeMessage('changeUsername')
  async changeUsername(
    @MessageBody() data: TUsername,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      await this.dmService.changeUsername(user.username, data.name);
      this.connectedUsers = this.connectedUsers.map((current) => {
        if (current.username === user.username) {
          current.username = data.name;
        }

        return current;
      });
      this.io.emit('usernameChanged');
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002')
          err.message = 'this username is already taken';
      }
      client.emit('usernameChangeError', err.message);
    }
  }
}
