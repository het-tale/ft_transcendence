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

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private dmService: DMService,
    private channelService: ChannelService,
    private friendsService: FriendsService,
  ) {}
  @WebSocketServer() io: Server;
  private connectedUsers: { clientId: string; username: string }[] = [];

  afterInit() {
    console.log('Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.auth.token;
    try {
      this.io.emit('userOnline', client.id);
      const user = await this.dmService.verifyToken(token);
      this.connectedUsers.push({
        clientId: client.id,
        username: user.username,
      });
      await this.dmService.changeUserStatus(user.username, 'online');
      console.log(this.connectedUsers);
      const offlineKickedChannels =
        await this.channelService.getOfflineKickedChannels(user.id);
      if (offlineKickedChannels.length > 0) {
        const socket = this.io.sockets[client.id];
        offlineKickedChannels.forEach((channel) => {
          socket.leave(channel.name);
        });
        this.channelService.deleteEmptyChannels(offlineKickedChannels);
      }
      const offlineUnbannedChannels =
        await this.channelService.getOfflineUnbannedChannels(user.id);
      if (offlineUnbannedChannels.length > 0) {
        const socket = this.io.sockets[client.id];
        offlineUnbannedChannels.forEach((channel) => {
          socket.join(channel.name);
        });
        this.channelService.deleteFromOfflineUnbannedChannels(
          offlineUnbannedChannels,
          user.id,
        );
      }
      const offlineMessages = await this.dmService.getOfflineMessages(user.id);
      console.log(offlineMessages);
      const offlineInvitations =
        await this.channelService.getOfflineInvitations(user.id);
      const offlineChannelMessages =
        await this.channelService.getOfflineChannelMessages(user.id);
      const offlineFriendRequests =
        await this.dmService.getOfflineFriendRequests(user.id);
      if (offlineChannelMessages.length > 0) {
        client.emit('offlineChannelMessages', offlineChannelMessages);
        this.channelService.deleteOfflineChannelMessages(
          offlineChannelMessages,
        );
      }
      if (offlineMessages.length > 0) {
        client.emit('offlineMessages', offlineMessages);
        this.dmService.changeOfflineMessagesStatus(offlineMessages);
      }
      if (offlineInvitations.length > 0) {
        client.emit('offlineInvitations', offlineInvitations);
        this.channelService.changeOfflineInvitationsStatus(offlineInvitations);
      }
      if (offlineFriendRequests.length > 0) {
        client.emit('offlineFriendRequests', offlineFriendRequests);
        this.dmService.changeOfflineFriendRequestsStatus(offlineFriendRequests);
      }
    } catch (err) {
      client.disconnect();
      console.error('Authentication failed:', err.message);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.io.emit('userOffline', client.id);
    const user = this.connectedUsers.find(
      (user) => user.clientId === client.id,
    );
    await this.dmService.changeUserStatus(user.username, 'offline');
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user.clientId !== client.id,
    );
    console.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (data.message === '') return;
      console.log(data);
      const sender = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      const receiver = this.connectedUsers.find(
        (user) => user.username === data.to,
      );
      console.log(data.to);
      const sentAt = new Date();
      let isPending = true;
      if (receiver) isPending = false;
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
    } catch (err) {
      console.log(err.message);
      client.emit('privateMessageError', err.message);
    }
  }
  @SubscribeMessage('createRoom')
  async createRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (
        data.type !== 'public' &&
        data.type !== 'protected' &&
        data.type !== 'private'
      ) {
        throw new Error('invalid room type');
      }
      if (data.type === 'protected' && !data.password) {
        throw new Error('password is required for protected rooms');
      }
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
    } catch (err) {
      client.emit('roomCreateError', err.message);
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
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
      this.io.to(data.room).emit('roomJoined', `${user.username} joined`);
    } catch (err) {
      client.emit('roomJoinError', err.message);
    }
  }

  @SubscribeMessage('sendRoomMessage')
  async sendRoomMessage(
    @MessageBody() data: any,
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
      this.io.to(data.room).emit('roomMessage', data.message);
    } catch (err) {
      client.emit('roomMessageError', err.message);
    }
  }
  @SubscribeMessage('sendRoomInvitation')
  async sendRoomInvitation(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const sender = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      );
      const receiver = this.connectedUsers.find(
        (user) => user.username === data.to,
      );
      let isReceiverOnline = false;
      await this.channelService.saveInvitation({
        sender: sender.username,
        receiver: data.to,
        room: data.room,
        isReceiverOnline,
      });
      if (receiver) {
        isReceiverOnline = true;
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
    @MessageBody() data: any,
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
        client
          .to(data.room)
          .emit('roomInvitationDeclined', { room: data.room });
      }
    } catch (err) {
      client.emit('roomInvitationError', err.message);
    }
  }
  @SubscribeMessage('leaveRoom')
  async leaveRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
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
  async kickUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      const kickedUser = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      let isOnline = false;
      if (kickedUser) isOnline = true;
      await this.channelService.kickUser(
        data.room,
        clientUsername,
        data.target,
        isOnline,
      );
      if (kickedUser) {
        const socket = this.io.sockets[kickedUser.clientId];
        socket.leave(data.room);
      }
      this.io.to(data.room).emit('userKicked', `${data.user} kicked`);
    } catch (err) {
      client.emit('userKickError', err.message);
    }
  }
  @SubscribeMessage('addAdmin')
  async addAdmin(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
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
  async banneUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      let isOnline = false;
      const bannedUser = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      if (bannedUser) isOnline = true;
      await this.channelService.banUser(
        data.room,
        clientUsername,
        data.target,
        isOnline,
      );
      if (bannedUser) {
        const socket = this.io.sockets[bannedUser.clientId];
        socket.leave(data.room);
      }
      this.io.to(data.room).emit('userBanned', `${data.target} banned`);
    } catch (err) {
      client.emit('userBanError', err.message);
    }
  }
  @SubscribeMessage('unbanUser')
  async unbanUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      let isOnline = false;
      const unbannedUser = this.connectedUsers.find(
        (user) => user.username === data.target,
      );
      if (unbannedUser) isOnline = true;
      await this.channelService.unbanUser(
        data.room,
        clientUsername,
        data.target,
        isOnline,
      );
      if (unbannedUser) {
        const socket = this.io.sockets[unbannedUser.clientId];
        socket.join(data.room);
      }
      this.io.to(data.room).emit('userUnbanned', `${data.target} unbanned`);
    } catch (err) {
      client.emit('userUnbanError', err.message);
    }
  }
  @SubscribeMessage('muteUser')
  async muteUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
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
    @MessageBody() data: any,
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
  async addFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
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
    } catch (err) {
      client.emit('friendRequestError', err.message);
    }
  }
  @SubscribeMessage('handleFriendRequest')
  async handleFriendRequest(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
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
      if (receiver) {
        if (data.isAccepted) {
          this.io.to(receiver.clientId).emit('friendRequestAccepted', {
            from: clientUsername,
          });
        } else {
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
    @MessageBody() data: any,
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
  async blockUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      await this.friendsService.blockUser(clientUsername, data.target);
      this.io.to(client.id).emit('userBlocked');
    } catch (err) {
      client.emit('userBlockError', err.message);
    }
  }
  @SubscribeMessage('unblockUser')
  async unblockUser(
    @MessageBody() data: any,
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
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientUsername = this.connectedUsers.find(
        (user) => user.clientId === client.id,
      ).username;
      this.io.to(data.room).emit('channelDeleted');
      await this.channelService.deleteChannel(
        data.room,
        clientUsername,
        this.io,
        this.connectedUsers,
      );
    } catch (err) {
      client.emit('channelDeleteError', err.message);
    }
  }
}
