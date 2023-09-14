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
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private chatService: ChatService) {}
  @WebSocketServer() io: Server;
  private connectedUsers: { clientId: string; username: string }[] = [];

  afterInit() {
    console.log('Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.query.token;
    try {
      const user = await this.chatService.verifyToken(token);
      this.connectedUsers.push({
        clientId: client.id,
        username: user.username,
      });
      console.log(this.connectedUsers);
      const offlineMessages = await this.chatService.getOfflineMessages(
        user.userId,
      );
      if (offlineMessages.length > 0) {
        client.emit('offline messages', offlineMessages);
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
    await this.chatService.saveMessage({
      sender: sender.username,
      receiver: receiver.username,
      message: data.message,
      date: sentAt,
      isOnline,
    });
  }
}
