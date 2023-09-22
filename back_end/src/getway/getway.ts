import { Injectable, OnModuleInit } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { interval } from 'rxjs';
import { colision } from './colision';
import { GameData, Room, Ball, Paddle, INTERVAL, INCREASE_SPEED, SPEED_INTERVAL, Player } from '../types';

// const MAX_ANGLE_CHANGE = Math.PI / 4;

@WebSocketGateway()
@Injectable()
export class MyGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private rooms: Map<string, Room> = new Map();

	onModuleInit() {
	}
	private containerWidth = 1080;
	private containerHeight = 720;

	handleConnection(client: any) {
		console.log('Client connected: ', client.id);

		let exist: boolean = false;
		const padd = new Paddle(10 , this.containerHeight / 2, 8, 80, 3);
		const otherpadd = new Paddle(this.containerWidth - 10, this.containerHeight / 2, 8, 80, 3);
		
		for (const existRoom of this.rooms.values()) {
			console.log('at room ', existRoom.roomName, ' players ', existRoom.players.length);
			if (existRoom.players.length === 1) {
				exist = true;
				const playerNumber = existRoom.players.length + 1;
				const player = new Player(playerNumber, client, padd, existRoom.roomName, 0);
			existRoom.players.push(player);
			client.join(existRoom.roomName);
			const gamedata: GameData = {
				playerpad: player.paddle,
				otherpad: playerNumber === 1 ? otherpadd : padd,
				ball: existRoom.ball,
				playerScore: 0,
				otherScore: 0,
				rounds: existRoom.rounds,
				containerHeight: this.containerHeight,
				containerWidth: this.containerWidth,
				id: playerNumber,
			}
			client.emit('JoinRoom', existRoom.roomName);
			client.emit('InitGame', gamedata);
			this.server.to(existRoom.roomName).emit('StartGame', existRoom.roomName);
			this.startGame(existRoom);
				break;
			}
		}
		
		if (!exist) {
			let room = new Room(Math.random().toString(36).substring(7));
			this.rooms.set(room.roomName, room);
			console.log('new room created with name ', room.roomName)
			const playerNumber = room.players.length + 1;
			const player = new Player(playerNumber, client, otherpadd, room.roomName, 0);
			room.players.push(player);
			client.join(room.roomName);
	
			const gamedata: GameData = {
				playerpad: player.paddle,
				otherpad: playerNumber === 1 ? otherpadd : padd,
				ball: room.ball,
				playerScore: 0,
				otherScore: 0,
				rounds: room.rounds,
				containerHeight: this.containerHeight,
				containerWidth: this.containerWidth,
				id: playerNumber,
			}
			client.emit('JoinRoom', room.roomName);
			client.emit('InitGame', gamedata);
		}
	}

	handleDisconnect(client: any) {
		const room = this.findRoomByPlayerSocket(client);

		if (room) {
			room.players = room.players.filter((player) => player.socket !== client);
			if (room.players.length < 2) {
				this.stopGame(room);
				room.gameActive = false;
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
	handleUpdatePaddle(client: any, eventData: any) {
		const room = this.findRoomByPlayerSocket(client);

		if (room) {
			const player = room.players.find((p) => p.socket === client);

			if (player) {
				// Receive relative mouse position and container height from the client
				const relativeMouseYPercentage = eventData.relativeMouseY;
				const containerHeight = this.containerHeight;

				// Calculate the new paddle position based on the received data
				player.paddle.y = (relativeMouseYPercentage / 100) * containerHeight;
			}
		}
	}

	private startGame(room: Room) {
		console.log("startGame");
		if (!room.gameActive) {
			room.gameActive = true;
			room.gameInterval = interval(INTERVAL).subscribe(() => {
				if (!room.gameActive) {
					this.stopGame(room);
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
		room.gameActive = false;
		if (room.gameInterval) {
			// this.rooms
			room.gameInterval.unsubscribe();
		}
	}

	private updateGame(room: Room) {
		// Calculate the new ball position based on its current position and velocity
		if (Date.now() - room.lastspeedincrease > SPEED_INTERVAL) {
			room.lastspeedincrease = Date.now();
			room.ball.dx += room.ball.dx > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
			room.ball.dy += room.ball.dy > 0 ? INCREASE_SPEED : -INCREASE_SPEED;
			
		}
		// room.ball.setXY(room.ball.x + room.ball.dx, room.ball.y + room.ball.dy);
		room.ball.x += room.ball.dx
		room.ball.y += room.ball.dy
		// Check for collisions with top and bottom walls
		if (room.ball.y - room.ball.radius <= 0 || room.ball.y + room.ball.radius > this.containerHeight) {
			// Reverse the vertical velocity of the ball
			room.ball.dy *= -1
		}
		colision(room);
	}
}
