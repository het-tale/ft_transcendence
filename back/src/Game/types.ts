// import { Socket } from 'dgram';
import { Subscription } from 'rxjs';
import { Socket } from 'socket.io';
export class Paddle {
  constructor(x: number, y: number, width: number, height: number, dy: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dy = dy;
  }
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
}

export class Ball {
  constructor(x: number, y: number, radius: number, dx: number, dy: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = dx;
    this.dy = dy;
  }
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
  containerHeight: number;
  containerWidth: number;
  id: number;
}

export class Player {
  constructor(
    id: number,
    socket: Socket,
    paddle: Paddle,
    room: string,
    score: number,
  ) {
    this.id = id;
    this.socket = socket;
    this.paddle = paddle;
    this.room = room;
    this.score = score;
  }
  id: number;
  socket: Socket;
  paddle: Paddle;
  room: string;
  score: number;
}

export interface IventMouse {
  y: number;
  top: number;
  hight: number;
  width: number;
}

export class Room {
  constructor(roomName: string) {
    this.id = null;
    this.roomName = roomName;
    this.players = [];
    this.gameActive = false;
    this.gameInterval = null;
    this.lastspeedincrease = Date.now();
    const random = Math.random();
    switch (true) {
      case random < 0.2:
        this.ball = new Ball(CONTAINERWIDTH / 2, CONTAINERHIEGHT / 2, RADIUS, 3, 3);
        break;
      case random < 0.4:
        this.ball = new Ball(CONTAINERWIDTH / 2, CONTAINERHIEGHT / 2, RADIUS, 3, -3);
        break;
      case random < 0.6:
        this.ball = new Ball(CONTAINERWIDTH / 2, CONTAINERHIEGHT / 2, RADIUS, -3, 3);
        break;
      case random < 0.8:
        this.ball = new Ball(CONTAINERWIDTH / 2, CONTAINERHIEGHT / 2, RADIUS, -3, -3);
        break;
      default:
        this.ball = new Ball(CONTAINERWIDTH / 2, CONTAINERHIEGHT / 2, RADIUS, 3, 3);
        break;
    }
    this.rounds = 5;
  }
  id: number;
  roomName: string;
  players: Player[];
  gameActive: boolean;
  gameInterval: Subscription;
  lastspeedincrease: number;
  ball: Ball;
  rounds: number;
}

export const INTERVAL = 16.66;
export const INCREASE_SPEED = 1;
export const SPEED_INTERVAL = 1000;
export const CONTAINERHIEGHT = 480;
export const CONTAINERWIDTH = 720;
export const RADIUS = 10;
