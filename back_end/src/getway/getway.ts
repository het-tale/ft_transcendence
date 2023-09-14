import { Injectable, OnModuleInit } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { interval, take } from 'rxjs';
import { colision } from './colision';
import { GameData, Room, defaultBall, defaultOtherPaddle, defaultPaddle, ROUNDS, INTERVAL, INCREASE_SPEED, SPEED_INTERVAL } from '../types';
import { ClientRequest } from 'http';

@WebSocketGateway()
@Injectable()
export class MyGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

//	 private players: Player[] = [];
	private rooms: Map<string, Room> = new Map();
	private gameInterval: any;
	private gameActive = false;

	onModuleInit() {
		// Initialize env variables if nedded not socket
	}

	handleConnection(client: any) {
		console.log('Client connected: ', client.id);

		let room : Room | undefined;

	for (const existRoom of this.rooms.values()) {
		if (existRoom.players.length === 1) {
			room = existRoom;
			break;
		}
	}

	if (!room) {
		room = new Room();
		room.roomName = Math.random().toString(36).substring(7);
		room.lastspeedincrease = Date.now();
		this.rooms.set(room.roomName, room);
		room.players.push({ id: room.players.length + 1, socket: client, paddle: defaultPaddle, room: room.roomName, score: 0 });
		client.join(room.roomName);
		client.emit('JoinRoom', room.roomName);
		let gamedata: GameData = {
			playerpad: defaultPaddle,
			otherpad: defaultOtherPaddle,
			ball: defaultBall,
			playerScore: 0,
			otherScore: 0,
			rounds: ROUNDS,
			id: room.players.length + 1,
			padlleSpeed: 3,
		};
		client.emit('InitGame', gamedata);
	}
	else
	{
		room.players.push({ id: room.players.length + 1, socket: client, paddle: defaultOtherPaddle, room: room.roomName , score: 0});
		client.join(room.roomName);
		client.emit('JoinRoom', room.roomName);
		const gamedata: GameData = {
			playerpad: defaultOtherPaddle,
			otherpad: defaultPaddle,
			ball: defaultBall,
			playerScore: 0,
			otherScore: 0,
			rounds: ROUNDS,
			id: room.players.length + 1,
			padlleSpeed: 3,
		};
		client.emit('InitGame', gamedata);
		this.server.to(room.roomName).emit('StartGame', room.roomName);
		this.startGame(room);
		this.gameActive = true;
	}
}

handleDisconnect(client: any) {
	const room = this.findRoomByPlayerSocket(client);
	
	if (room) {
		room.players = room.players.filter((player) => player.socket !== client);
		if (room.players.length < 2) {
			this.stopGame(room);
			this.gameActive = false;
			this.rooms.delete(room.roomName); // Remove the room if it's empty
		}
	}
}

private findRoomByPlayerSocket(socket: any): Room | undefined {
	for (const room of this.rooms.values()) {
		const playerInRoom = room.players.find((player) => player.socket === socket);
		if (playerInRoom) {
			return room;
		}
	}
	return undefined;
}

	@SubscribeMessage('UpdatePlayerPaddle')
	handleUpdatePaddle(client: any, event: any) {
		const room = this.findRoomByPlayerSocket(client);
		if (room) {
			const player = room.players.find((p) => p.socket === client);
			if (player){
				// Constrain the paddle's position within the canvas boundaries
				const minY = event.top;
				const maxY = event.top + event.hight - player.paddle.height;
				player.paddle.y = Math.max(minY, Math.min(event.y, maxY));
			}
		}
	}

private startGame(room: Room) {
	console.log("startGame");
	if (!this.gameActive) {
		this.gameActive = true;
		this.gameInterval = interval(INTERVAL).subscribe(() => {
			if (!this.gameActive) {
			this.gameInterval.unsubscribe();
			return;
			}
			this.updateGame(room);
		});
	}
}

private stopGame(room: Room) {
	console.log("stopGame");
	//dell room from map
	this.rooms.delete(room.roomName);
	this.gameActive = false;
	if (this.gameInterval){
		this.rooms
		this.gameInterval.unsubscribe();
	}
}

private updateGame(room: Room) {
	// Calculate the new ball position based on its current position and velocity
	room.ball.x += room.ball.dx;
	room.ball.y += room.ball.dy;
	// Check for collisions with top and bottom walls
	if (room.ball.y - room.ball.radius < 0 || room.ball.y + room.ball.radius > 300) {
		room.ball.dy *= -1; // Reverse the vertical velocity of the ball
	}
	colision(room);
	if (Date.now() - room.lastspeedincrease > SPEED_INTERVAL)
	{
		room.lastspeedincrease = Date.now();
		room.ball.dx += room.ball.dx > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
		room.ball.dy += room.ball.dy > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
	}
}
}
