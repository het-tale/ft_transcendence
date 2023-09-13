import {
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

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token;
    try {
      const username = await this.chatService.verifyToken(token);
      this.connectedUsers.push({ clientId: client.id, username });
      console.log(this.connectedUsers);
    } catch (err) {
      client.disconnect();
      console.error('Authentication failed:', err.message);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handleMessage(client: Socket, data: any) {
    console.log(`Message received from client id: ${client.id}`);
    console.log(`Payload: ${data}`);

    return {
      event: 'pong',
      data,
    };
  }
  @SubscribeMessage('private message')
  async handlePrivateMessage(client: Socket, data: any) {
    console.log(`client is heeeeeere`);
    console.log(client);
    const sender = this.connectedUsers.find(
      (user) => user.clientId === client.id,
    );
    const receiver = this.connectedUsers.find(
      (user) => user.username === data.to,
    );
    const sentAt = new Date();
    await this.chatService.saveMessage({
      sender: sender.username,
      receiver: receiver.username,
      message: data.message,
      date: sentAt,
    });

    client.to(data.to).emit('private message', {
      from: sender.username,
      message: data.message,
    });
  }
}
