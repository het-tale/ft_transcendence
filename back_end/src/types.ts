import { Socket } from 'dgram';
export interface Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	dy: number;
}

export interface Ball {
	x: number;
	y: number;
	radius: number;
	dx: number;
	dy: number;
}
export interface GameData {
	playerpad: Paddle;
	otherpad: Paddle;
	ball: Ball;
	playerScore: number;
	otherScore: number;
	rounds: number;
	id: number;
	containerHeight: number;
	containerWidth: number;
}

export interface Player {
	id: number;
	socket: Socket;
	paddle: Paddle;
	room: string;
	score: number;
}

export interface IventMouse{
	y: number;
	top: number;
	hight: number;
	width: number;
}

export class Room {
	players: Player[] = [];
	ball: Ball = defaultBall;
	lastspeedincrease: number;
	roomName: string = "";
	}

export const defaultPaddle: Paddle = {
	x: 980,
	y: 500,
	width: 8,
	height: 80,
	dy: 3,
};

export const defaultOtherPaddle: Paddle = {
	x: 20,
	y: 500,
	width: 8,
	height: 80,
	dy: 3,
};

export const defaultBall: Ball = {
	x: 500,
	y: 300,
	radius: 5,
	dx: 3,
	dy: 3,
};

export const ROUNDS = 3;
export const INTERVAL = 16;
export const INCREASE_SPEED = 0.2;
export const SPEED_INTERVAL = 1000;