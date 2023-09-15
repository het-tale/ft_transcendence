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

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private dmService: DMService,
    private channelService: ChannelService,
  ) {}
  @WebSocketServer() io: Server;
  private connectedUsers: { clientId: string; username: string }[] = [];

  afterInit() {
    console.log('Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.query.token;
    try {
      const user = await this.dmService.verifyToken(token);
      this.connectedUsers.push({
        clientId: client.id,
        username: user.username,
      });
      console.log(this.connectedUsers);
      const offlineMessages = await this.dmService.getOfflineMessages(user.id);
      const offlineInvitations =
        await this.channelService.getOfflineInvitations(user.id);
      if (offlineMessages.length > 0) {
        client.emit('offline messages', offlineMessages);
      }
      if (offlineInvitations.length > 0) {
        client.emit('offline invitations', offlineInvitations);
      }
    } catch (err) {
      client.disconnect();
      console.error('Authentication failed:', err.message);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user.clientId !== client.id,
    );
    console.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('private message')
  async handlePrivateMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`client is heeeeeere ${client.id}`);
    const sender = this.connectedUsers.find(
      (user) => user.clientId === client.id,
    );
    const receiver = this.connectedUsers.find(
      (user) => user.username === data.to,
    );
    const sentAt = new Date();
    let isOnline = false;
    if (receiver) {
      isOnline = true;
      client.to(receiver.clientId).emit('private message', {
        from: sender.username,
        message: data.message,
      });
    }
    await this.dmService.saveMessage({
      sender: sender.username,
      receiver: receiver.username,
      message: data.message,
      date: sentAt,
      isOnline,
    });
  }
  @SubscribeMessage('createRoom')
  async createRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
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
      client.to(data.room).emit('roomCreated', { room: data.room });

      return { event: 'roomCreated', room: data.room };
    } catch (err) {
      return { event: 'roomCreationError', error: err.message };
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
        client.to(receiver.clientId).emit('room invitation', {
          from: sender.username,
          room: data.room,
        });
      }
    } catch (err) {
      return { event: 'roomInvitationError', error: err.message };
    }
  }
}
