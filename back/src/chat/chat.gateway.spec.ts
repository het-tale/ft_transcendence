import { Test } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';

async function createNestApp(...gateways: any): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  }).compile();

  return testingModule.createNestApplication();
}

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let app: INestApplication;
  let ioClient: Socket;
  let receiverClient: Socket;

  beforeAll(async () => {
    // Instantiate the app
    app = await createNestApp(ChatGateway);
    // Get the gateway instance from the app instance
    gateway = app.get<ChatGateway>(ChatGateway);
    // Create a new client that will interact with the gateway
    ioClient = io('http://localhost:3001', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
    // Create a new client that will receive messages from the gateway
    receiverClient = io('http://localhost:3001', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    app.listen(3001);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should emit 'pong' on 'ping'", async () => {
    ioClient.on('connect', () => {
      console.log('connected');
    });

    ioClient.on('pong', (data) => {
      expect(data).toBe('Hello world!');
    });

    ioClient.connect();
    await eventReception(ioClient, 'connect');

    ioClient.emit('ping', 'Hello world!');
    await eventReception(ioClient, 'pong');

    ioClient.disconnect();
  });
  it('should send a private message to another client', async () => {
    receiverClient.on('private message', (data) => {
      expect(data).toHaveProperty('from');
      expect(data.from).toBe(ioClient.id);
      expect(data).toHaveProperty('message');
      expect(data.message).toBe('Hello from the other side');
    });

    ioClient.connect();
    await eventReception(ioClient, 'connect');

    receiverClient.connect();
    await eventReception(receiverClient, 'connect');

    ioClient.emit('private message', {
      from: ioClient.id,
      to: receiverClient.id,
      message: 'Hello from the other side',
    });
    await eventReception(receiverClient, 'private message');

    ioClient.disconnect();
    receiverClient.disconnect();
  });
  it('should send the number of clients on the server when connecting', async () => {
    receiverClient.on('connected clients', (data) => {
      expect(data.length).toBe(2);
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userID: ioClient.id,
          }),
          expect.objectContaining({
            userID: receiverClient.id,
          }),
        ]),
      );
    });
    ioClient.connect();
    await eventReception(ioClient, 'connect');

    receiverClient.connect();
    await Promise.all([
      eventReception(receiverClient, 'connect'),
      eventReception(receiverClient, 'connected clients'),
    ]);

    // And we don't forget to disconnect clients once the test is finishing
    ioClient.disconnect();
    receiverClient.disconnect();

    // ...
  });
});
async function eventReception(from: Socket, event: string): Promise<void> {
  return new Promise<void>((resolve) => {
    from.on(event, () => {
      resolve();
    });
  });
}
